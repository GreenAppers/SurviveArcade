import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { CollectionService } from '@rbxts/services'
import { BallTag, BouncerTag } from 'ReplicatedStorage/shared/constants/tags'

@Component({ tag: BallTag })
export class BallComponent
  extends BaseComponent<{}, BasePart>
  implements OnStart
{
  onStart() {
    const ball = this.instance
    ball.Touched?.Connect((part) => {
      if (CollectionService.HasTag(part, BouncerTag)) {
        ball.ApplyImpulse(ball.Position.sub(part.Position).mul(1000))
      }
    })
  }
}
