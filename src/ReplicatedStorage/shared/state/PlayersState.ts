import { createProducer } from '@rbxts/reflex'

export interface PlayerData {
  readonly score: PlayerScore
}

export interface PlayerScore {
  readonly score: number
  readonly highScore: number
}

export type PlayerScoreType = keyof PlayerScore

export interface PlayersState {
  readonly [player: string]: PlayerData | undefined
}

export const defaultPlayerData = {
  score: {
    score: 0,
    highScore: 0,
  },
}

const KEY_TEMPLATE = '%d'
const initialState: PlayersState = {}

export const getPlayer = (players: PlayersState, userID: number) =>
  players[KEY_TEMPLATE.format(userID)]

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
    const player = KEY_TEMPLATE.format(userID)
    const scoreState = state[player]?.score
    const newScore = (scoreState?.score || 0) + (amount || 0)
    return {
      ...state,
      [player]: {
        score: {
          ...scoreState,
          score: newScore,
          highScore: math.max(scoreState?.highScore || 0, newScore),
        },
      },
    }
  },

  resetScore: (state, userID: number) => {
    const player = KEY_TEMPLATE.format(userID)
    const scoreState = state[player]?.score
    return {
      ...state,
      [player]: {
        score: {
          ...scoreState,
          score: 0,
          highScore: scoreState?.highScore || 0,
        },
      },
    }
  },
})
