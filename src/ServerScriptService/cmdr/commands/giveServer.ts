import { CommandContext } from '@rbxts/cmdr'
import { store } from 'ServerScriptService/store'

export = function (
  context: CommandContext,
  player: Player,
  currency: Currency,
  amount: number,
) {
  store.addPlayerCurrency(player.UserId, currency, amount)
}
