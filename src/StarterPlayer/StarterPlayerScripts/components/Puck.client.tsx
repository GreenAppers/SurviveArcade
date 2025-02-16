import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { PuckTag } from 'ReplicatedStorage/shared/constants/tags'

@Component({ tag: PuckTag })
export class PuckComponent
  extends BaseComponent<{}, BasePart>
  implements OnStart
{
  onStart() {
    const puck = this.instance
    puck.Touched?.Connect((part) => {
      print('Puck touched', part)
      puck.AssemblyLinearVelocity = new Vector3(
        puck.AssemblyLinearVelocity.X * 1.1,
        puck.AssemblyLinearVelocity.Y * 1.1,
        puck.AssemblyLinearVelocity.Z * 1.1,
      )
    })
  }
}
