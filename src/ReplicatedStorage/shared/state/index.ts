import Object from '@rbxts/object-utils'
import { CombineStates } from '@rbxts/reflex'
import { arcadeTablesSlice } from 'ReplicatedStorage/shared/state/ArcadeTablesState'
import {
  getPlayer,
  playersSlice,
} from 'ReplicatedStorage/shared/state/PlayersState'

export type SharedState = CombineStates<typeof slices>

export const slices = {
  arcadeTables: arcadeTablesSlice,
  players: playersSlice,
}

export const selectArcadeTablesState = () => (state: SharedState) =>
  state.arcadeTables

export const selectArcadeTableNameOwnedBy =
  (userId: number) => (state: SharedState) =>
    Object.entries(state.arcadeTables).find(
      ([_name, arcadeTable]) => arcadeTable?.owner?.UserId === userId,
    )?.[0] as ArcadeTableName | undefined

export const selectPlayersState = () => (state: SharedState) => state.players

export const selectPlayerState = (userID: number) => (state: SharedState) =>
  getPlayer(state.players, userID)
