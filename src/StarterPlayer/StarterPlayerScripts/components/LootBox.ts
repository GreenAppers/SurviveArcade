import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { LootBoxTag } from 'ReplicatedStorage/shared/constants/tags'
import {
  getCharacterHumanoid,
  getUserIdFromCharacter,
} from 'ReplicatedStorage/shared/utils/player'

@Component({ tag: LootBoxTag })
export class LootBoxComponent
  extends BaseComponent<{}, LootBox>
  implements OnStart
{
  onStart() {
    this.instance.HitBox.Touched?.Connect((hit) => {
      const humanoid = getCharacterHumanoid(hit.Parent)
      if (!humanoid) return

      const touchedPlayerUserId = getUserIdFromCharacter(hit.Parent)
      if (!touchedPlayerUserId) return

      game.Workspace.Audio.ButtonSuccess.Play()
    })
  }
}
