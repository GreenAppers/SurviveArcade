import { Controller } from '@flamework/core'
import { TycoonsState } from 'ReplicatedStorage/shared/state/TycoonState'
import { nearestTycoonPlot } from 'ReplicatedStorage/shared/utils/tycoon'

@Controller({})
export class TycoonController {
  findTycoonTarget(
    tycoonsState: TycoonsState,
    humanoidRootPart: BasePart,
    rootRigAttachment: Attachment,
  ): Attachment | undefined {
    // Find nearest Tycoon Plot
    const tycoonName = nearestTycoonPlot(
      humanoidRootPart.Position,
      tycoonsState,
    )
    if (!tycoonName) return undefined
    return game.Workspace.Map[tycoonName]?.ClaimTycoon.Button.Attachment
  }
}
