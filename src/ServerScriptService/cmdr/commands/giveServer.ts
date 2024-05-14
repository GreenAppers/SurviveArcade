import { CommandContext } from '@rbxts/cmdr'
import { ReplicatedStorage } from '@rbxts/services'

export = function (
  _context: CommandContext,
  player: Player,
  toolName: ToolName,
) {
  const backpack = player.FindFirstChild('Backpack') as Backpack | undefined
  if (!backpack || backpack.FindFirstChild(toolName)) return
  switch (toolName) {
    case 'Blocks':
      ReplicatedStorage.Tools.PlaceBlock.Clone().Parent = backpack
      ReplicatedStorage.Tools.BreakBlock.Clone().Parent = backpack
      break
    default:
      ReplicatedStorage.Tools[toolName].Clone().Parent = backpack
  }
}
