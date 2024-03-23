import { CommandContext } from '@rbxts/cmdr'
import { store } from 'ServerScriptService/store'

export = function (_context: CommandContext, difficulty: Difficulty) {
  store.setDifficulty(difficulty)
}
