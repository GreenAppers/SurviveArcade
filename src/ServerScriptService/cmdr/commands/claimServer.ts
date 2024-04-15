import { CommandContext } from '@rbxts/cmdr'
import { store } from 'ServerScriptService/store'

export = function (
  context: CommandContext,
  player: Player,
  tycoon: TycoonName | 'None',
) {
  if (tycoon === 'None') {
    store.resetPlayerTycoon(player.UserId)
  } else {
    store.claimTycoon(tycoon, player.UserId)
  }
}
