import { CombineStates } from '@rbxts/reflex'
import { USER_ID } from 'ReplicatedStorage/shared/constants/core'
import {
  arcadeTablesSlice,
  findArcadeTableNameOwnedBy,
} from 'ReplicatedStorage/shared/state/ArcadeTablesState'
import { gameSlice } from 'ReplicatedStorage/shared/state/GameState'
import {
  getPlayer,
  playersSlice,
} from 'ReplicatedStorage/shared/state/PlayersState'
import { tycoonsSlice } from 'ReplicatedStorage/shared/state/TycoonState'

export type SharedState = CombineStates<typeof slices>

export const slices = {
  arcadeTables: arcadeTablesSlice,
  game: gameSlice,
  players: playersSlice,
  tycoons: tycoonsSlice,
}

export const selectArcadeTablesState = () => (state: SharedState) =>
  state.arcadeTables

export const selectArcadeTableState =
  (tableName: ArcadeTableName | ArcadeTableNextName) => (state: SharedState) =>
    state.arcadeTables[tableName]

export const selectArcadeTableNameOwnedBy =
  (userId: number) => (state: SharedState) =>
    findArcadeTableNameOwnedBy(state.arcadeTables, userId)

export const selectDifficulty = () => (state: SharedState) =>
  state.game.difficulty

export const selectGameState = () => (state: SharedState) => state.game

export const selectPlayersState = () => (state: SharedState) => state.players

export const selectPlayerState = (userID: number) => (state: SharedState) =>
  getPlayer(state.players, userID)

export const selectPlayerScore = (userID: number) => (state: SharedState) =>
  getPlayer(state.players, userID)?.score || 0

export const selectPlayerGuideEnabled =
  (userID: number) => (state: SharedState) =>
    getPlayer(state.players, userID)?.settings?.guide

export const selectLocalPlayerState = () => (state: SharedState) =>
  getPlayer(state.players, USER_ID)

export const selectLocalPlayerMusicEnabled = () => (state: SharedState) =>
  getPlayer(state.players, USER_ID)?.settings?.music

export const selectLocalPlayerLoops = () => (state: SharedState) =>
  getPlayer(state.players, USER_ID)?.completed?.loops || 0

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

export const selectTycoonsState = () => (state: SharedState) => state.tycoons
