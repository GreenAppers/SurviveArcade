import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { LavaTag } from 'ReplicatedStorage/shared/constants/tags'
import { getCharacterHumanoid } from 'ReplicatedStorage/shared/utils/player'

@Component({ tag: LavaTag })
export class LavaComponent
  extends BaseComponent<{}, BasePart>
  implements OnStart
{
  onStart() {
    const lavaHumanoid = getCharacterHumanoid(this.instance.Parent)
    this.instance.Touched?.Connect((part) => {
      if (lavaHumanoid && !lavaHumanoid.Health) return
      const humanoid = getCharacterHumanoid(part.Parent)
      if (!humanoid) return
      humanoid.Health = 0
    })
  }
}
