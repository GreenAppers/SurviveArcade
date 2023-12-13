import { CombineStates } from '@rbxts/reflex'
import { pinballTablesSlice } from './PinballTablesState'
import { getPlayer, playersSlice } from './PlayersState'

export type SharedState = CombineStates<typeof slices>

export const slices = {
  pinballTables: pinballTablesSlice,
  players: playersSlice,
}

export const selectPinballTablesState = () => (state: SharedState) =>
  state.pinballTables

export const selectPlayerState = (userID: number) => (state: SharedState) =>
  getPlayer(state.players, userID)
