import { BaseComponent, Component } from '@flamework/components'
import { OnStart, OnTick } from '@flamework/core'
import { Logger } from '@rbxts/log'
import { Workspace } from '@rbxts/services'
import SimplePath from '@rbxts/simplepath'
import {
  BEHAVIOR_TREE_STATUS,
  CHARACTER_CHILD,
} from 'ReplicatedStorage/shared/constants/core'
import { NPCTag } from 'ReplicatedStorage/shared/constants/tags'
import { selectPlayerState, SharedState } from 'ReplicatedStorage/shared/state'
import {
  BehaviorObject,
  getBehaviorTime,
  PathStatus,
} from 'ReplicatedStorage/shared/utils/behavior'
import {
  getUserIdFromNPCId,
  NPCIdAttributeName,
} from 'ReplicatedStorage/shared/utils/player'
import {
  NPCPopulation,
  NPCService,
} from 'ServerScriptService/services/NPCService'
import { PlayerService } from 'ServerScriptService/services/PlayerService'
import { store } from 'ServerScriptService/store'

@Component({ tag: NPCTag })
export class NPCComponent
  extends BaseComponent<NPCAttributes, Model>
  implements OnStart, OnTick
{
  behavior: BehaviorObject = { Blackboard: {}, treeRunning: false }
  humanoid?: Humanoid
  humanoidRootPart?: BasePart
  path?: SimplePath
  population?: NPCPopulation
  rootRigAttachment?: Attachment
  userId?: number

  constructor(
    protected logger: Logger,
    protected npcService: NPCService,
    protected readonly playerService: PlayerService,
  ) {
    super()
  }

  onGravityChanged(upVector?: Vector3) {
    if (!this.humanoidRootPart || !this.rootRigAttachment) return
    this.humanoidRootPart.FindFirstChild('BodyGyro')?.Destroy()
    this.humanoidRootPart.FindFirstChild('VectorForce')?.Destroy()
    if (!upVector || (upVector.X === 0 && upVector.Y === 1 && upVector.Z === 0))
      return

    const characterUpVector = this.humanoidRootPart.CFrame.UpVector
    const rotateCharacterAxis = characterUpVector.Cross(upVector)
    const rotateCharacterAngle = math.acos(characterUpVector.Dot(upVector))
    const gyro = new Instance('BodyGyro')
    gyro.P = 25000
    gyro.MaxTorque = new Vector3(100000, 100000, 100000)
    gyro.CFrame = this.humanoidRootPart.CFrame
    gyro.CFrame = CFrame.fromAxisAngle(
      rotateCharacterAxis,
      rotateCharacterAngle,
    )
      .mul(this.humanoidRootPart.CFrame.Rotation)
      .add(this.humanoidRootPart.CFrame.Position)
    gyro.Parent = this.humanoidRootPart

    const vForce = new Instance('VectorForce')
    vForce.Force = new Vector3(0, 1, 0)
      .sub(upVector.Unit)
      .mul(Workspace.Gravity * this.humanoidRootPart.AssemblyMass)
    vForce.ApplyAtCenterOfMass = true
    vForce.RelativeTo = Enum.ActuatorRelativeTo.World
    vForce.Attachment0 = this.rootRigAttachment
    vForce.Parent = this.humanoidRootPart
  }

  onStart() {
    const [npcId, newNpcId] = this.npcService.getNextId(this.attributes.NPCType)
    const userId = getUserIdFromNPCId(npcId)
    this.humanoid = this.instance.FindFirstChildOfClass(
      CHARACTER_CHILD.Humanoid,
    )
    this.humanoidRootPart = this.instance.FindFirstChild<BasePart>(
      CHARACTER_CHILD.HumanoidRootPart,
    )
    this.rootRigAttachment =
      this.humanoidRootPart?.FindFirstChildOfClass('Attachment')
    this.population = this.npcService.population[this.attributes.NPCType]
    this.userId = userId
    this.instance.Name = this.population.name.format(npcId)
    this.instance.SetAttribute(NPCIdAttributeName, npcId)
    if (this.population.createPlayer) {
      if (newNpcId) store.addNPC(userId, this.instance.Name)
    }
    this.logger.Info(`Spawned NPC ${this.instance.Name} (${this.userId})`)

    if (this.population.pathFinding) {
      this.humanoid?.SetStateEnabled(Enum.HumanoidStateType.Climbing, true)
      this.path = new SimplePath(this.instance, {
        AgentCanClimb: true,
      })
      if (this.population.pathFindingVisualize) this.path.Visualize = true
      this.path.Reached.Connect(
        () => (this.behavior.pathStatus = PathStatus.Reached),
      )
      this.path.Blocked.Connect(
        () => (this.behavior.pathStatus = PathStatus.Blocked),
      )
      this.path.Error.Connect((err) => {
        this.behavior.pathStatus = PathStatus.Error
        this.behavior.pathError = `${err}`
      })
      this.path.Stopped.Connect(
        () => (this.behavior.pathStatus = PathStatus.Stopped),
      )
    }

    let previousHealth = 100
    this.humanoid?.GetPropertyChangedSignal('Health')?.Connect(() => {
      const health = this.humanoid?.Health ?? 0
      const lessHealth = health < previousHealth
      previousHealth = health
      if (!lessHealth) return
      const specialMesh = this.instance
        .FindFirstChild('Shell')
        ?.FindFirstChild<SpecialMesh>('Mesh')
      if (!specialMesh) return
      specialMesh.VertexColor = new Vector3(1, 0, 0)
      wait(0.2)
      specialMesh.VertexColor = new Vector3(1, 1, 1)
    })

    this.humanoid?.Died?.Connect(() => {
      if (this.humanoid)
        this.playerService.handleKO(this.humanoid, userId, this.instance.Name)
      wait(1)
      this.path?.Destroy()
      this.path = undefined
      this.instance.Destroy()
    })

    let previousGravity: Vector3 | undefined
    const npcSelector = selectPlayerState(this.userId)
    while (this.humanoid && this.humanoid.Health > 0 && wait(0.3)[0]) {
      const state = store.getState()
      const npcState = npcSelector(state)
      const gravity = npcState?.groundArcadeTableName
        ? npcState.gravityUp
        : undefined
      if (
        gravity?.X !== previousGravity?.X ||
        gravity?.Y !== previousGravity?.Y ||
        gravity?.Z !== previousGravity?.Z
      ) {
        this.onGravityChanged(gravity)
        previousGravity = gravity
      }

      const behaviorTree = this.population.behaviorTree
      if (
        !behaviorTree ||
        (this.behavior.treeRunning && this.population.behaviorTreeOnTick)
      )
        continue

      this.runBehaviorTree(state)
    }
  }

  onTick() {
    if (!this.behavior.treeRunning || !this.population?.behaviorTreeOnTick)
      return
    this.runBehaviorTree(store.getState())
  }

  runBehaviorTree(state: SharedState) {
    try {
      const wasRunning = this.behavior.treeRunning
      if (wasRunning) {
        const blackboard = this.behavior.Blackboard
        blackboard.state = state
        delete blackboard.time
      } else {
        this.behavior.Blackboard = {
          path: this.path,
          serverStore: store,
          sourceAttachment: this.rootRigAttachment,
          sourceHumanoid: this.humanoid,
          sourceHumanoidRootPart: this.humanoidRootPart,
          sourceInstance: this.instance,
          sourceSpawnNumber: this.userId
            ? selectPlayerState(this.userId)(state)?.KOd
            : undefined,
          sourceUserId: this.userId,
          state,
        }
      }
      const treeRunning =
        this.population?.behaviorTree?.run(this.behavior) ===
        BEHAVIOR_TREE_STATUS.RUNNING
      this.behavior.treeRunning = treeRunning
      if (treeRunning) {
        const now = getBehaviorTime(this.behavior)
        this.behavior.previousRunningTime = now
        if (!wasRunning) this.behavior.startedRunningTime = now
      }
    } catch (e) {
      this.logger.Warn(
        `Error running behavior tree for ${this.instance.Name}: ${e}`,
      )
    }
  }
}
