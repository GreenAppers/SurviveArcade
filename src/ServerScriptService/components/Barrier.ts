import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { BarrierTag } from 'ReplicatedStorage/shared/constants/tags'
import { getCharacterHumanoid } from 'ReplicatedStorage/shared/utils/player'

@Component({ tag: BarrierTag })
export class BarrierComponent
  extends BaseComponent<{}, BasePart>
  implements OnStart
{
  debounce = false

  onStart() {
    this.instance.Touched?.Connect((hit) => {
      if (this.debounce) return
      const humanoid = getCharacterHumanoid(hit.Parent)
      if (!humanoid) return
      this.debounce = true
      this.instance.Transparency = 0
      task.wait(1)
      this.instance.Transparency = 1
      this.debounce = false
    })
  }
}
