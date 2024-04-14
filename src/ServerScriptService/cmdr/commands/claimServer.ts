import { CommandContext } from '@rbxts/cmdr'
import { store } from 'ServerScriptService/store'

export = function (
  context: CommandContext,
  player: Player,
  tycoon: TycoonName,
) {
  store.claimTycoon(tycoon, player)
}
