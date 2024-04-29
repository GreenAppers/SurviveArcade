import { Controller } from '@flamework/core'
import {
  getPlayerCurrency,
  PlayerState,
} from 'ReplicatedStorage/shared/state/PlayersState'
import { TycoonsState } from 'ReplicatedStorage/shared/state/TycoonState'
import { getCurrency } from 'ReplicatedStorage/shared/utils/currency'
import {
  getTycoonType,
  nearestTycoonPlot,
  tycoonConstants,
} from 'ReplicatedStorage/shared/utils/tycoon'

@Controller({})
export class TycoonController {
  findTycoonTarget(
    tycoonsState: TycoonsState,
    humanoidRootPart: BasePart,
    _rootRigAttachment: Attachment,
  ): Attachment | undefined {
    // Find nearest Tycoon Plot
    const tycoonName = nearestTycoonPlot(
      humanoidRootPart.Position,
      tycoonsState,
    )
    if (!tycoonName) return undefined
    return game.Workspace.Map[tycoonName]?.ClaimTycoon.Button.Attachment
  }

  findTycoonButtonTarget(
    tycoonName: TycoonName,
    playerState?: PlayerState,
  ): Attachment | undefined {
    const tycoon = game.Workspace.Tycoons[tycoonName]
    const tycoonType = getTycoonType(tycoon?.GetAttribute('TycoonType'))
    if (!tycoon || !tycoonType || !playerState) return undefined

    const constants = tycoonConstants[tycoonType]
    for (const button of tycoon.Buttons.GetChildren() as TycoonButtonModel[]) {
      if (button.Button.CanTouch === false) continue
      const details = constants.Buttons[button.Name]
      const currency = getCurrency(details.Currency)
      const cost = details.Cost
      if (cost && currency && getPlayerCurrency(playerState, currency) >= cost)
        return button.Button.Attachment
    }
    return undefined
  }
}
