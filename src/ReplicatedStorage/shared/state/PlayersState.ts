import Object from '@rbxts/object-utils'
import { createProducer } from '@rbxts/reflex'
import { mapProperties } from '../utils/object'

export interface PlayerData {
  readonly score: PlayerScore
}

export type PlayerDataType = keyof PlayerData

export interface PlayerScore {
  readonly score: number
  readonly highScore: number
}

export type PlayerScoreType = keyof PlayerScore

export interface PlayersState {
  readonly [playerKey: string]: PlayerData | undefined
}

export const defaultPlayerData = {
  score: {
    score: 0,
    highScore: 0,
  },
}

const KEY_TEMPLATE = '%d'
const initialState: PlayersState = {}

export const getPlayer = (state: PlayersState, userID: number) =>
  state[KEY_TEMPLATE.format(userID)]

export const playersSlice = createProducer(initialState, {
  loadPlayerData: (state, userID: number, data: PlayerData) => ({
    ...state,
    [KEY_TEMPLATE.format(userID)]: data,
  }),

  closePlayerData: (state, userID: number) => ({
    ...state,
    [KEY_TEMPLATE.format(userID)]: undefined,
  }),

  addScore: (state, userID: number, amount: number) => {
    const playerKey = KEY_TEMPLATE.format(userID)
    const scoreState = state[playerKey]?.score
    const newScore = (scoreState?.score || 0) + (amount || 0)
    return {
      ...state,
      [playerKey]: {
        score: {
          ...scoreState,
          score: newScore,
          highScore: math.max(scoreState?.highScore || 0, newScore),
        },
      },
    }
  },

  resetScores: (state) =>
    mapProperties(state, (playerState) => ({
      ...playerState,
      score: { ...defaultPlayerData.score },
    })),

  resetScore: (state, userID: number) => {
    const playerKey = KEY_TEMPLATE.format(userID)
    const scoreState = state[playerKey]?.score
    return {
      ...state,
      [playerKey]: {
        score: {
          ...scoreState,
          score: 0,
          highScore: scoreState?.highScore || 0,
        },
      },
    }
  },
})
