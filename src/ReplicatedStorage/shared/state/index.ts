import { CombineProducers, CombineStates } from '@rbxts/reflex'
import { USER_ID } from 'ReplicatedStorage/shared/constants/core'
import {
  arcadeTablesSlice,
  findArcadeTableNameOwnedBy,
} from 'ReplicatedStorage/shared/state/ArcadeTablesState'
import { gameSlice } from 'ReplicatedStorage/shared/state/GameState'
import {
  getPlayerCurrency,
  getPlayerState,
  playersSlice,
} from 'ReplicatedStorage/shared/state/PlayersState'
import { tycoonsSlice } from 'ReplicatedStorage/shared/state/TycoonState'

export type SharedState = CombineStates<typeof slices>
export type SharedStore = CombineProducers<typeof slices>

export const slices = {
  arcadeTables: arcadeTablesSlice,
  game: gameSlice,
  players: playersSlice,
  tycoons: tycoonsSlice,
}

export const selectArcadeTablesState = () => (state: SharedState) =>
  state.arcadeTables

export const selectArcadeTableState =
  (tableName: ArcadeTableName) => (state: SharedState) =>
    state.arcadeTables[tableName]

export const selectArcadeTableType =
  (tableName: ArcadeTableName) => (state: SharedState) =>
    state.arcadeTables[tableName].tableType

export const selectArcadeTableNameOwnedBy =
  (userId: number) => (state: SharedState) =>
    findArcadeTableNameOwnedBy(state.arcadeTables, userId)

export const selectDifficulty = () => (state: SharedState) =>
  state.game.difficulty

export const selectGameState = () => (state: SharedState) => state.game

export const selectPlayersState = () => (state: SharedState) => state.players

export const selectPlayerState = (userID: number) => (state: SharedState) =>
  getPlayerState(state.players, userID)

export const selectPlayerCurrency =
  (userID: number, currency: Currency) => (state: SharedState) =>
    getPlayerCurrency(getPlayerState(state.players, userID), currency)

export const selectPlayerScore = (userID: number) => (state: SharedState) =>
  getPlayerState(state.players, userID)?.score || 0

export const selectPlayerGuideEnabled =
  (userID: number) => (state: SharedState) =>
    getPlayerState(state.players, userID)?.settings?.guide

export const selectPlayerTycoonButtons =
  (userID: number, tycoonType: TycoonType) => (state: SharedState) =>
    getPlayerState(state.players, userID)?.tycoon?.[tycoonType]?.buttons

export const selectLocalPlayerState = () => (state: SharedState) =>
  getPlayerState(state.players, USER_ID)

export const selectLocalPlayerMusicEnabled = () => (state: SharedState) =>
  getPlayerState(state.players, USER_ID)?.settings?.music

export const selectLocalPlayerLoops = () => (state: SharedState) =>
  getPlayerState(state.players, USER_ID)?.completed?.loops || 0

export const selectLocalPlayerGroundArcadeTableName =
  () => (state: SharedState) =>
    getPlayerState(state.players, USER_ID)?.groundArcadeTableName

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

export const selectTycoonState =
  (tycoonName: TycoonName) => (state: SharedState) =>
    state.tycoons[tycoonName]
