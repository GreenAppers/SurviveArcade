import { CommandContext } from '@rbxts/cmdr'
import { ARCADE_TABLE_NAMES } from 'ReplicatedStorage/shared/constants/core'
import { getArcadeTableSpawn } from 'ReplicatedStorage/shared/utils/arcade'

export = function (context: CommandContext, player: Player, target: string) {
  let targetFrame: CFrame | undefined
  switch (target.lower()) {
    case ARCADE_TABLE_NAMES[0].lower():
      targetFrame = getArcadeTableSpawn(
        game.Workspace.ArcadeTables[ARCADE_TABLE_NAMES[0]],
      )
      break
    case ARCADE_TABLE_NAMES[1].lower():
      targetFrame = getArcadeTableSpawn(
        game.Workspace.ArcadeTables[ARCADE_TABLE_NAMES[1]],
      )
      break
    case ARCADE_TABLE_NAMES[2].lower():
      targetFrame = getArcadeTableSpawn(
        game.Workspace.ArcadeTables[ARCADE_TABLE_NAMES[2]],
      )
      break
    case ARCADE_TABLE_NAMES[3].lower():
      targetFrame = getArcadeTableSpawn(
        game.Workspace.ArcadeTables[ARCADE_TABLE_NAMES[3]],
      )
      break
  }
  if (!targetFrame) return
  player.Character?.SetPrimaryPartCFrame(targetFrame)
}
