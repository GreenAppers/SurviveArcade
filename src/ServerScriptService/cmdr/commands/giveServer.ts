import { CommandContext } from '@rbxts/cmdr'
import {
  getBackpackToolName,
  giveTool,
} from 'ServerScriptService/components/ToolGiver'
import { store } from 'ServerScriptService/store'

export = function (
  _context: CommandContext,
  player: Player,
  itemName: Currency | ToolName,
  amount: number,
) {
  if (
    itemName === 'Dollars' ||
    itemName === 'Levity' ||
    itemName === 'Tickets'
  ) {
    store.addPlayerCurrency(player.UserId, itemName, amount)
  } else {
    const backpack = player.FindFirstChild<Backpack>('Backpack')
    if (!backpack || backpack.FindFirstChild(getBackpackToolName(itemName)))
      return
    giveTool(itemName, backpack)
  }
}
