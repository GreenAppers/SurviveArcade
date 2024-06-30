import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { CURRENCY_TYPES } from 'ReplicatedStorage/shared/constants/core'
import { LootBoxTag } from 'ReplicatedStorage/shared/constants/tags'
import {
  getCharacterHumanoid,
  getUserIdFromCharacter,
} from 'ReplicatedStorage/shared/utils/player'
import { store } from 'ServerScriptService/store'

@Component({ tag: LootBoxTag })
export class LootBoxComponent
  extends BaseComponent<{}, LootBox>
  implements OnStart
{
  debounce = false

  onStart() {
    this.instance.HitBox.Touched?.Connect((hit) => {
      const humanoid = getCharacterHumanoid(hit.Parent)
      if (!humanoid) return
      const touchedPlayerUserId = getUserIdFromCharacter(hit.Parent)
      if (!touchedPlayerUserId || this.debounce) return
      this.debounce = true
      store.addPlayerCurrency(touchedPlayerUserId, CURRENCY_TYPES.Tickets, 20)
      this.instance.Destroy()
    })
  }
}
