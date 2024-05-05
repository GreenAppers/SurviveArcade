import { CommandContext } from '@rbxts/cmdr'
import { ReplicatedStorage } from '@rbxts/services'

export = function (
  _context: CommandContext,
  player: Player,
  toolName: ToolName,
) {
  const backpack = player.FindFirstChild('Backpack') as Backpack | undefined
  if (!backpack || backpack.FindFirstChild(toolName)) return
  const tool = ReplicatedStorage.Tools[toolName].Clone()
  tool.Parent = backpack
}
