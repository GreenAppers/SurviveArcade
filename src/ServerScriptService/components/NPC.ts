import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import SimplePath from '@rbxts/simplepath'
import { CHARACTER_CHILD } from 'ReplicatedStorage/shared/constants/core'
import { NPCTag } from 'ReplicatedStorage/shared/constants/tags'
import { BehaviorObject } from 'ReplicatedStorage/shared/utils/behavior'
import { getUserIdFromNPCName } from 'ReplicatedStorage/shared/utils/player'
import { NPCService } from 'ServerScriptService/services/NPCService'
import { store } from 'ServerScriptService/store'

@Component({ tag: NPCTag })
export class NPCComponent
  extends BaseComponent<NPCAttributes, Model>
  implements OnStart
{
  behavior: BehaviorObject = { Blackboard: {} }
  humanoid?: Humanoid
  humanoidRootPart?: BasePart
  path?: SimplePath
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

    const population = this.npcService.population[this.attributes.NPCType]
    if (population.pathFinding) this.path = new SimplePath(this.instance)

    this.humanoid?.Died?.Connect(() => {
      wait(1)
      this.instance.Destroy()
    })

    while (this.humanoid && this.humanoid.Health > 0 && wait(0.3)[0]) {
      const behaviorTree = population.behaviorTree
      if (!behaviorTree) continue

      this.behavior.Blackboard = {
        path: this.path,
        sourceAttachment: this.rootRigAttachment,
        sourceHumanoid: this.humanoid,
        sourceHumanoidRootPart: this.humanoidRootPart,
        sourceInstance: this.instance,
        sourceUserId: this.userId,
        state: store.getState(),
      }

      behaviorTree.run(this.behavior)
    }
  }
}
