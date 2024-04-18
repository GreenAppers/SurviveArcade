import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { Players } from '@rbxts/services'
import { TycoonButtonTag } from 'ReplicatedStorage/shared/constants/tags'
import {
  selectPlayerTycoonButtons,
  selectTycoonState,
} from 'ReplicatedStorage/shared/state'
import { getTycoonFromDescendent } from 'ReplicatedStorage/shared/utils/tycoon'
import { store } from 'ServerScriptService/store'
import { setHidden } from 'ServerScriptService/utils'

@Component({ tag: TycoonButtonTag })
export class TycoonButtonComponent
  extends BaseComponent<{ Cost: number; Currency: Currency }, BasePart>
  implements OnStart
{
  onStart() {
    const buttonName = this.instance.Parent?.Name || ''
    const tycoon = getTycoonFromDescendent(this.instance)
    const tycoonType = tycoon?.GetAttribute('TycoonType') as
      | TycoonType
      | undefined
    if (!tycoon || !tycoonType) throw error('Button has no ancestor Tycoon')
    const tycoonSelector = selectTycoonState(tycoon.Name)

    this.instance.Touched?.Connect((hit) => {
      const humanoid = hit.Parent?.FindFirstChild('Humanoid') as
        | Humanoid
        | undefined
      if (!humanoid) return
      const touchedPlayer = Players.GetPlayerFromCharacter(hit.Parent)
      if (!touchedPlayer) return

      const state = store.getState()
      if (tycoonSelector(state)?.owner !== touchedPlayer.UserId) return

      const newState = store.purchaseTycoonButton(
        touchedPlayer.UserId,
        tycoonType,
        buttonName,
        this.attributes.Currency,
        this.attributes.Cost,
      )
      const tycoonButtonsSelector = selectPlayerTycoonButtons(
        touchedPlayer.UserId,
        tycoonType,
      )
      if (tycoonButtonsSelector(state) === tycoonButtonsSelector(newState))
        return

      const purchasedItem = tycoon.Items.FindFirstChild(buttonName)
      if (purchasedItem) setHidden(purchasedItem, false)
    })
  }
}
