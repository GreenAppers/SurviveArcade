import { CommandContext } from '@rbxts/cmdr'
import { giveTool } from 'ServerScriptService/components/ToolGiver'

export = function (
  _context: CommandContext,
  player: Player,
  toolName: ToolName,
) {
  const backpack = player.FindFirstChild<Backpack>('Backpack')
  if (!backpack || backpack.FindFirstChild(toolName)) return
  giveTool(toolName, backpack)
}
