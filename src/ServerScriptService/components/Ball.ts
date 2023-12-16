import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { BallTag } from 'ReplicatedStorage/shared/constants/tags'

@Component({ tag: BallTag })
export class BallComponent
  extends BaseComponent<{}, BasePart>
  implements OnStart
{
  onStart() {
    this.instance.Touched?.Connect((part) => {
      const humanoid = part.Parent?.FindFirstChild('Humanoid') as
        | Humanoid
        | undefined
      if (!humanoid) return
      humanoid.Health = 0
    })
  }
}
