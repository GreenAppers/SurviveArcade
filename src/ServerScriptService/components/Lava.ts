import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { LavaTag } from 'ReplicatedStorage/shared/constants/tags'
import {
  getCharacterHumanoid,
  getUserIdFromCharacter,
} from 'ReplicatedStorage/shared/utils/player'
import { takeDamage } from 'ServerScriptService/utils/player'

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
      takeDamage(
        humanoid,
        math.huge,
        lavaHumanoid ? getUserIdFromCharacter(this.instance.Parent) : undefined,
        'lava',
      )
    })
  }
}
