import { CombineStates } from '@rbxts/reflex'
import {
  arcadeTablesSlice,
  findArcadeTableNameOwnedBy,
} from 'ReplicatedStorage/shared/state/ArcadeTablesState'
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

export const selectArcadeTableState =
  (tableName: ArcadeTableName | ArcadeTableNextName) => (state: SharedState) =>
    state.arcadeTables[tableName]

export const selectArcadeTableNameOwnedBy =
  (userId: number) => (state: SharedState) =>
    findArcadeTableNameOwnedBy(state.arcadeTables, userId)

export const selectGameState = () => (state: SharedState) => state.game

export const selectPlayersState = () => (state: SharedState) => state.players

export const selectPlayerState = (userID: number) => (state: SharedState) =>
  getPlayer(state.players, userID)

export const selectPlayerScore = (userID: number) => (state: SharedState) =>
  getPlayer(state.players, userID)?.score

export const selectPlayerGuideEnabled =
  (userID: number) => (state: SharedState) =>
    getPlayer(state.players, userID)?.guide

export const selectLocalPlayerState = () => (state: SharedState) =>
  getPlayer(state.players, USER_ID)

export const selectLocalPlayerMusicEnabled = () => (state: SharedState) =>
  getPlayer(state.players, USER_ID)?.music

export const selectLocalPlayerScoreState = () => (state: SharedState) =>
  getPlayer(state.players, USER_ID)?.score

export const selectLocalPlayerGroundArcadeTableName =
  () => (state: SharedState) =>
    getPlayer(state.players, USER_ID)?.groundArcadeTableName

export const selectLocalPlayerArcadeTableStatus = () => {
  const localPlayerArcadeTableNameSelector =
    selectArcadeTableNameOwnedBy(USER_ID)
  return (state: SharedState) => {
    const localPlayerArcadeTableName = localPlayerArcadeTableNameSelector(state)
    return localPlayerArcadeTableName
      ? state.arcadeTables[localPlayerArcadeTableName]?.status
      : undefined
  }
}
