import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { TYCOON_ATTRIBUTES } from 'ReplicatedStorage/shared/constants/core'
import { TycoonButtonTag } from 'ReplicatedStorage/shared/constants/tags'
import {
  selectPlayerCurrency,
  selectPlayerTycoonButtons,
  selectTycoonState,
} from 'ReplicatedStorage/shared/state'
import { getCurrency } from 'ReplicatedStorage/shared/utils/currency'
import {
  getCharacterHumanoid,
  getUserIdFromCharacter,
} from 'ReplicatedStorage/shared/utils/player'
import {
  getTycoonFromDescendent,
  getTycoonType,
  tycoonConstants,
} from 'ReplicatedStorage/shared/utils/tycoon'
import { store } from 'StarterPlayer/StarterPlayerScripts/store'

@Component({ tag: TycoonButtonTag })
export class TycoonButtonComponent
  extends BaseComponent<{}, BasePart>
  implements OnStart
{
  onStart() {
    const buttonName = this.instance.Parent?.Name || ''
    const tycoon = getTycoonFromDescendent(this.instance)
    const tycoonType = getTycoonType(
      tycoon?.GetAttribute(TYCOON_ATTRIBUTES.TycoonType),
    )
    if (!tycoon || !tycoonType) throw 'Button has no ancestor Tycoon'
    const constants = tycoonConstants[tycoonType]
    const buttonDetails = constants.Buttons[buttonName]
    const buttonCurrency = getCurrency(buttonDetails?.Currency)
    if (!buttonDetails || !buttonCurrency) throw 'Button has no details'
    const tycoonSelector = selectTycoonState(tycoon.Name)

    this.instance.Touched?.Connect((hit) => {
      const humanoid = getCharacterHumanoid(hit.Parent)
      if (!humanoid) return

      const touchedPlayerUserId = getUserIdFromCharacter(hit.Parent)
      if (!touchedPlayerUserId) return

      const state = store.getState()
      const tycoonState = tycoonSelector(state)
      if (tycoonState.owner !== touchedPlayerUserId) return

      const tycoonButtonsSelector = selectPlayerTycoonButtons(
        touchedPlayerUserId,
        tycoonType,
      )
      const purchasedTycoonButtons = tycoonButtonsSelector(state)
      if (purchasedTycoonButtons?.[buttonName]) {
        // Already purchased button
        return
      }

      const playerCurrency = selectPlayerCurrency(
        touchedPlayerUserId,
        buttonCurrency,
      )(state)
      if (playerCurrency < buttonDetails.Cost) {
        // Insufficient funds
        game.Workspace.Audio.ButtonFail.Play()
        return
      }

      // Handle button purchased
      game.Workspace.Audio.ButtonSuccess.Play()
    })
  }
}
