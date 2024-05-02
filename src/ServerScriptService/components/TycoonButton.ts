import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { Players, ReplicatedStorage } from '@rbxts/services'
import { TYCOON_ATTRIBUTES } from 'ReplicatedStorage/shared/constants/core'
import { TycoonButtonTag } from 'ReplicatedStorage/shared/constants/tags'
import {
  selectPlayerState,
  selectPlayerTycoonButtons,
  selectTycoonState,
} from 'ReplicatedStorage/shared/state'
import { getCurrency } from 'ReplicatedStorage/shared/utils/currency'
import {
  getTycoonButtonColor,
  getTycoonFromDescendent,
  getTycoonType,
  isTycoonButtonDependencyMet,
  tycoonConstants,
} from 'ReplicatedStorage/shared/utils/tycoon'
import { store } from 'ServerScriptService/store'
import { animateBuildingIn } from 'ServerScriptService/utils/buildin'
import { setHidden } from 'ServerScriptService/utils/instance'

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
    if (!tycoon || !tycoonType) throw error('Button has no ancestor Tycoon')
    const constants = tycoonConstants[tycoonType]
    const buttonDetails = constants.Buttons[buttonName]
    const buttonCurrency = getCurrency(buttonDetails?.Currency)
    if (!buttonDetails || !buttonCurrency) throw error('Button has no details')
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
        buttonCurrency,
        buttonDetails.Cost,
      )
      const tycoonButtonsSelector = selectPlayerTycoonButtons(
        touchedPlayer.UserId,
        tycoonType,
      )
      if (tycoonButtonsSelector(state) === tycoonButtonsSelector(newState))
        return
      const playerState = selectPlayerState(touchedPlayer.UserId)(newState)
      const playerTycoonButtons = selectPlayerTycoonButtons(
        touchedPlayer.UserId,
        tycoonType,
      )(newState)

      let buildingAnimation
      const tycoonTemplate = ReplicatedStorage.Tycoons[tycoonType]
      const itemTemplate = tycoonTemplate.Items.FindFirstChild(buttonName) as
        | Model
        | undefined

      if (itemTemplate) {
        const item = itemTemplate.Clone()
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
      for (const button of tycoon.Buttons.GetChildren() as TycoonButtonModel[]) {
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
