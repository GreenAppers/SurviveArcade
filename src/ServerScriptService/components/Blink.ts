import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { BlinkTag } from 'ReplicatedStorage/shared/constants/tags'

@Component({ tag: BlinkTag })
export class LavaComponent
  extends BaseComponent<{}, BasePart>
  implements OnStart
{
  onStart() {
    for (;;) {
      this.instance.Transparency = 0
      wait(0.3)
      this.instance.Transparency = 0.8
      wait(1.1)
    }
  }
}
