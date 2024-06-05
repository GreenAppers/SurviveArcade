import { BaseComponent, Component } from '@flamework/components'
import { OnStart, OnTick } from '@flamework/core'
import { Logger } from '@rbxts/log'
import SimplePath from '@rbxts/simplepath'
import {
  BEHAVIOR_TREE_STATUS,
  CHARACTER_CHILD,
} from 'ReplicatedStorage/shared/constants/core'
import { NPCTag } from 'ReplicatedStorage/shared/constants/tags'
import {
  BehaviorObject,
  PathStatus,
} from 'ReplicatedStorage/shared/utils/behavior'
import { getUserIdFromNPCName } from 'ReplicatedStorage/shared/utils/player'
import {
  NPCPopulation,
  NPCService,
} from 'ServerScriptService/services/NPCService'
import { store } from 'ServerScriptService/store'

@Component({ tag: NPCTag })
export class NPCComponent
  extends BaseComponent<NPCAttributes, Model>
  implements OnStart, OnTick
{
  behavior: BehaviorObject = { Blackboard: {} }
  behaviorTreeRunning = false
  humanoid?: Humanoid
  humanoidRootPart?: BasePart
  path?: SimplePath
  population?: NPCPopulation
  rootRigAttachment?: Attachment
  userId?: number

  constructor(
    protected logger: Logger,
    protected npcService: NPCService,
  ) {
    super()
  }

  onStart() {
    this.humanoid = this.instance.FindFirstChildOfClass(
      CHARACTER_CHILD.Humanoid,
    )
    this.humanoidRootPart = this.instance.FindFirstChild<BasePart>(
      CHARACTER_CHILD.HumanoidRootPart,
    )
    this.rootRigAttachment =
      this.humanoidRootPart?.FindFirstChildOfClass('Attachment')
    this.userId = getUserIdFromNPCName(this.instance.Name)

    this.population = this.npcService.population[this.attributes.NPCType]

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
      wait(1)
      this.instance.Destroy()
    })

    while (this.humanoid && this.humanoid.Health > 0 && wait(0.3)[0]) {
      const behaviorTree = this.population.behaviorTree
      if (
        !behaviorTree ||
        (this.behaviorTreeRunning && this.population.behaviorTreeOnTick)
      )
        continue

      this.behavior.Blackboard = {
        path: this.path,
        sourceAttachment: this.rootRigAttachment,
        sourceHumanoid: this.humanoid,
        sourceHumanoidRootPart: this.humanoidRootPart,
        sourceInstance: this.instance,
        sourceUserId: this.userId,
        state: store.getState(),
      }

      this.runBehaviorTree()
    }
  }

  onTick() {
    if (!this.behaviorTreeRunning || !this.population?.behaviorTreeOnTick)
      return
    this.runBehaviorTree()
  }

  runBehaviorTree() {
    try {
      this.behaviorTreeRunning =
        this.population?.behaviorTree?.run(this.behavior) ===
        BEHAVIOR_TREE_STATUS.RUNNING
      if (this.behaviorTreeRunning) this.behavior.lastRunning = time()
    } catch (e) {
      this.logger.Warn(
        `Error running behavior tree for ${this.instance.Name}: ${e}`,
      )
    }
  }
}
