import { CommandContext } from '@rbxts/cmdr'
import { CURRENCY_TYPES } from 'ReplicatedStorage/shared/constants/core'
import { store } from 'ServerScriptService/store'

export = function (
  context: CommandContext,
  player: Player,
  currency: Currency,
  amount: number,
) {
  switch (currency) {
    case CURRENCY_TYPES.Dollars:
      store.addDollars(player.UserId, amount)
      break
    case CURRENCY_TYPES.Levity:
      store.addLevity(player.UserId, amount)
      break
    case CURRENCY_TYPES.Tickets:
      store.addTickets(player.UserId, amount)
      break
  }
}
