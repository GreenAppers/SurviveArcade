import { Controller } from '@flamework/core'
import {
  getPlayerCurrency,
  PlayerState,
} from 'ReplicatedStorage/shared/state/PlayersState'
import { TycoonsState } from 'ReplicatedStorage/shared/state/TycoonState'
import {
  getTycoonButtonCost,
  getTycoonButtonCurrency,
  nearestTycoonPlot,
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
    if (!tycoon || !playerState) return undefined
    for (const button of tycoon.Buttons.GetChildren() as TycoonButtonModel[]) {
      if (button.Button.CanTouch === false) continue
      const cost = getTycoonButtonCost(button)
      const currency = getTycoonButtonCurrency(button)
      if (cost && currency && getPlayerCurrency(playerState, currency) >= cost)
        return button.Button.Attachment
    }
    return undefined
  }
}
