import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { MarketplaceService, Players, ReplicatedStorage } from '@rbxts/services'
import { TYCOON_ATTRIBUTES } from 'ReplicatedStorage/shared/constants/core'
import { TycoonButtonTag } from 'ReplicatedStorage/shared/constants/tags'
import {
  selectPlayerState,
  selectPlayerTycoonButtons,
  selectTycoonState,
} from 'ReplicatedStorage/shared/state'
import { getCurrency } from 'ReplicatedStorage/shared/utils/currency'
import { setHidden } from 'ReplicatedStorage/shared/utils/instance'
import {
  getCharacterHumanoid,
  getUserIdFromCharacter,
} from 'ReplicatedStorage/shared/utils/player'
import {
  getTycoonButtonColor,
  getTycoonFromDescendent,
  getTycoonType,
  isTycoonButtonDependencyMet,
  tycoonConstants,
} from 'ReplicatedStorage/shared/utils/tycoon'
import {
  getProductForCurrency,
  getProductId,
} from 'ServerScriptService/services/TransactionService'
import { TycoonService } from 'ServerScriptService/services/TycoonService'
import { store } from 'ServerScriptService/store'
import { animateBuildingIn } from 'ServerScriptService/utils/buildin'

@Component({ tag: TycoonButtonTag })
export class TycoonButtonComponent
  extends BaseComponent<{}, BasePart>
  implements OnStart
{
  constructor(private tycoonService: TycoonService) {
    super()
  }

  onStart() {
    const buttonName = this.instance.Parent?.Name || ''
    const tycoon = getTycoonFromDescendent(this.instance)
    const tycoonType = getTycoonType(
      tycoon?.GetAttribute(TYCOON_ATTRIBUTES.TycoonType),
    )
    if (!tycoon || !tycoonType) throw error('Button has no ancestor Tycoon')
    const constants = tycoonConstants[tycoonType]
    const buttonDetails = constants.Buttons[buttonName]
    const buttonCurrency = getCurrency(buttonDetails?.Currency)
    if (!buttonDetails || !buttonCurrency) throw error('Button has no details')
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
      if (purchasedTycoonButtons?.[buttonName]) return

      const newState = store.purchaseTycoonButton(
        touchedPlayerUserId,
        tycoonType,
        buttonName,
        buttonCurrency,
        buttonDetails.Cost,
      )
      if (purchasedTycoonButtons === tycoonButtonsSelector(newState)) {
        // Insufficient funds
        const product = getProductForCurrency(buttonCurrency)
        const touchedPlayer = Players.GetPlayerFromCharacter(hit.Parent)
        if (product && touchedPlayer)
          MarketplaceService.PromptProductPurchase(
            touchedPlayer,
            getProductId(product),
          )
        return
      }

      // Handle button purchased
      const playerState = selectPlayerState(touchedPlayerUserId)(newState)
      const playerTycoonButtons = selectPlayerTycoonButtons(
        touchedPlayerUserId,
        tycoonType,
      )(newState)

      let buildingAnimation
      const tycoonTemplate = ReplicatedStorage.Tycoons[tycoonType]
      const itemTemplate =
        tycoonTemplate.Items.FindFirstChild<Model>(buttonName)

      if (itemTemplate) {
        const item = itemTemplate.Clone()
        this.tycoonService.setupTycoonItem(item, tycoonState)
        const relativeCFrame = tycoonTemplate.Baseplate.CFrame.ToObjectSpace(
          itemTemplate.GetPivot(),
        )
        const targetCFrame =
          tycoon.Baseplate.CFrame.ToWorldSpace(relativeCFrame)
        item.Parent = tycoon.Items
        item.PivotTo(targetCFrame)
        buildingAnimation = animateBuildingIn(
          item,
          new TweenInfo(0.5, Enum.EasingStyle.Linear, Enum.EasingDirection.Out),
        )
      }

      let thisButton
      for (const button of tycoon.Buttons.GetChildren<TycoonButtonModel>()) {
        if (button.Name === buttonName) {
          thisButton = button
          continue
        }
        const details = constants.Buttons[button.Name]
        if (isTycoonButtonDependencyMet(details, playerTycoonButtons)) {
          button.Button.BrickColor = getTycoonButtonColor(
            playerState,
            getCurrency(details.Currency),
            details.Cost,
          )
          setHidden(button, false)
        }
      }

      thisButton?.Destroy()
      buildingAnimation?.Wait()
    })
  }
}
