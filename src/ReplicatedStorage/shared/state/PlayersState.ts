import { createProducer } from '@rbxts/reflex'
import { mapProperties } from 'ReplicatedStorage/shared/utils/object'

export interface PlayerData {
  readonly guide: boolean
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
  guide: true,
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
    const playerState = state[playerKey]
    const scoreState = playerState?.score
    const newScore = (scoreState?.score || 0) + (amount || 0)
    return {
      ...state,
      [playerKey]: {
        ...(playerState ?? defaultPlayerData),
        score: {
          ...scoreState,
          score: newScore,
          highScore: math.max(scoreState?.highScore || 0, newScore),
        },
      },
    }
  },

  resetScore: (state, userID: number) => {
    const playerKey = KEY_TEMPLATE.format(userID)
    const playerState = state[playerKey]
    const scoreState = playerState?.score
    return {
      ...state,
      [playerKey]: {
        ...(playerState ?? defaultPlayerData),
        score: {
          ...scoreState,
          score: 0,
          highScore: scoreState?.highScore || 0,
        },
      },
    }
  },

  resetScores: (state) =>
    mapProperties(state, (playerState) => ({
      ...playerState,
      score: { ...defaultPlayerData.score },
    })),

  toggleGuide: (state, userID: number) => {
    const playerKey = KEY_TEMPLATE.format(userID)
    const playerState = state[playerKey]
    return {
      ...state,
      [playerKey]: {
        ...(playerState ?? defaultPlayerData),
        guide: !playerState?.guide,
      },
    }
  },
})
