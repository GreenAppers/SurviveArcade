import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { PuckTag } from 'ReplicatedStorage/shared/constants/tags'

@Component({ tag: PuckTag })
export class BallComponent
  extends BaseComponent<{}, BasePart>
  implements OnStart
{
  onStart() {
    const puck = this.instance
    puck.Touched?.Connect((part) => {
      print('Puck touched', part)
      puck.AssemblyLinearVelocity = new Vector3(
        puck.AssemblyLinearVelocity.X * 3,
        puck.AssemblyLinearVelocity.Y * 3,
        puck.AssemblyLinearVelocity.Z * 3,
      )
    })
  }
}
