import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { CHARACTER_CHILD } from 'ReplicatedStorage/shared/constants/core'
import { NPCTag } from 'ReplicatedStorage/shared/constants/tags'
import { BehaviorObject } from 'ReplicatedStorage/shared/utils/behavior'
import { getUserIdFromNPCName } from 'ReplicatedStorage/shared/utils/player'
import { NPCService } from 'ServerScriptService/services/NPCService'

@Component({ tag: NPCTag })
export class NPCComponent
  extends BaseComponent<NPCAttributes, Model>
  implements OnStart
{
  behavior: BehaviorObject = { Blackboard: {} }
  humanoid?: Humanoid
  humanoidRootPart?: BasePart
  userId?: number

  constructor(protected npcService: NPCService) {
    super()
  }

  onStart() {
    this.humanoid = this.instance.FindFirstChildOfClass('Humanoid')
    this.humanoidRootPart = this.instance.FindFirstChild<BasePart>(
      CHARACTER_CHILD.HumanoidRootPart,
    )
    this.userId = getUserIdFromNPCName(this.instance.Name)

    this.humanoid?.Died?.Connect(() => {
      wait(1)
      this.instance.Destroy()
    })

    while (this.humanoid && this.humanoid.Health > 0 && wait(0.3)[0]) {
      const behaviorTree =
        this.npcService.population[this.attributes.NPCType].behaviorTree
      if (!behaviorTree) continue

      this.behavior.Blackboard = {
        sourceHumanoid: this.humanoid,
        sourceHumanoidRootPart: this.humanoidRootPart,
        sourceInstance: this.instance,
        sourceUserId: this.userId,
      }

      behaviorTree.run(this.behavior)
    }
  }
}
