import Object from '@rbxts/object-utils'
import { CombineStates } from '@rbxts/reflex'
import { arcadeTablesSlice } from 'ReplicatedStorage/shared/state/ArcadeTablesState'
import {
  getPlayer,
  playersSlice,
} from 'ReplicatedStorage/shared/state/PlayersState'

import { USER_ID } from '../constants/core'
import { gameSlice } from './GameState'

export type SharedState = CombineStates<typeof slices>

export const slices = {
  arcadeTables: arcadeTablesSlice,
  game: gameSlice,
  players: playersSlice,
}

export const selectArcadeTablesState = () => (state: SharedState) =>
  state.arcadeTables

export const selectArcadeTableNameOwnedBy =
  (userId: number) => (state: SharedState) =>
    Object.entries(state.arcadeTables).find(
      ([_name, arcadeTable]) => arcadeTable?.owner?.UserId === userId,
    )?.[0] as ArcadeTableName | undefined

export const selectGameState = () => (state: SharedState) => state.game

export const selectPlayersState = () => (state: SharedState) => state.players

export const selectPlayerState = (userID: number) => (state: SharedState) =>
  getPlayer(state.players, userID)

export const selectLocalPlayerState = () => (state: SharedState) =>
  getPlayer(state.players, USER_ID)

export const selectLocalPlayerScoreState = () => (state: SharedState) =>
  getPlayer(state.players, USER_ID)?.score
