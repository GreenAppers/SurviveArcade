import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'

@Component({ tag: 'Ball' })
export class BallComponent extends BaseComponent implements OnStart {
  onStart() {
    const ball = this.instance as BasePart
    ball.Touched?.Connect((part) => {
      if (part.Name === 'Bouncer') {
        ball.ApplyImpulse(ball.Position.sub(part.Position).mul(1000))
      }
    })
  }
}
