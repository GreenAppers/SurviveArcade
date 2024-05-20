import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { NPCTag } from 'ReplicatedStorage/shared/constants/tags'
import { NPCService } from 'ServerScriptService/services/NPCService'
import { findChildHumanoid } from 'ServerScriptService/utils/instance'

@Component({ tag: NPCTag })
export class NPCComponent
  extends BaseComponent<NPCAttributes, Model>
  implements OnStart
{
  behavior: BehaviorObject = {
    Blackboard: {},
  }

  constructor(protected npcService: NPCService) {
    super()
  }

  onStart() {
    const sourceHumanoid = findChildHumanoid(this.instance)
    const sourceHumanoidRootPart = this.instance.FindFirstChild(
      'HumanoidRootPart',
    ) as BasePart | undefined

    sourceHumanoid?.Died?.Connect(() => {
      wait(1)
      this.instance.Destroy()
    })

    while (wait(0)[0]) {
      const behaviorTree =
        this.npcService.npc[this.attributes.NPCType].behaviorTree
      if (!behaviorTree) continue

      this.behavior.Blackboard = {
        sourceHumanoid,
        sourceHumanoidRootPart,
        sourceInstance: this.instance,
      }

      behaviorTree.run(this.behavior)
    }
  }
}
