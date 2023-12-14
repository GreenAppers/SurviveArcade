import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'

@Component({ tag: 'Ball' })
export class BallComponent extends BaseComponent implements OnStart {
  onStart() {
    const ball = this.instance as BasePart
    ball.Touched?.Connect((part) => {
      const humanoid = part.Parent?.FindFirstChild('Humanoid') as
        | Humanoid
        | undefined
      if (!humanoid) return
      humanoid.Health = 0
    })
  }
}
