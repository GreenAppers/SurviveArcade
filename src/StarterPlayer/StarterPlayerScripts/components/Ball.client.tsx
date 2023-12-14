import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'

@Component({ tag: 'Ball' })
export class BallComponent extends BaseComponent implements OnStart {
  onStart() {
    const ball = this.instance as BasePart
    print(`Wow Client! I'm attached to ${this.instance.GetFullName()}`)
    ball.Touched?.Connect((part) => {
      if (part.Name === 'Bouncer') {
        ball.ApplyImpulse(ball.Position.sub(part.Position).Unit.mul(1000))
      }
    })
  }
}
