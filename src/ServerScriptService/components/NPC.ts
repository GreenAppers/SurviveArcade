import { BaseComponent, Component } from '@flamework/components'
import { OnStart, OnTick } from '@flamework/core'
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

  constructor(protected npcService: NPCService) {
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
    this.behaviorTreeRunning =
      this.population?.behaviorTree?.run(this.behavior) ===
      BEHAVIOR_TREE_STATUS.RUNNING
    if (this.behaviorTreeRunning) this.behavior.lastRunning = time()
  }
}
