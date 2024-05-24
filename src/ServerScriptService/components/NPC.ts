import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { CHARACTER_CHILD } from 'ReplicatedStorage/shared/constants/core'
import { NPCTag } from 'ReplicatedStorage/shared/constants/tags'
import { NPCService } from 'ServerScriptService/services/NPCService'

@Component({ tag: NPCTag })
export class NPCComponent
  extends BaseComponent<NPCAttributes, Model>
  implements OnStart
{
  humanoid?: Humanoid
  humanoidRootPart?: BasePart
  behavior: BehaviorObject = { Blackboard: {} }

  constructor(protected npcService: NPCService) {
    super()
  }

  onStart() {
    this.humanoid = this.instance.FindFirstChildOfClass('Humanoid')
    this.humanoidRootPart = this.instance.FindFirstChild(
      CHARACTER_CHILD.HumanoidRootPart,
    ) as BasePart | undefined

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
      }

      behaviorTree.run(this.behavior)
    }
  }
}
