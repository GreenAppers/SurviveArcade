import { createProducer } from '@rbxts/reflex'
import { DIFFICULTY_TYPES } from 'ReplicatedStorage/shared/constants/core'

export interface GameState {
  readonly difficulty: Difficulty
  readonly roundActive: boolean
  readonly roundLength: number
  readonly roundRemaining: number
  readonly roundStarted: DateTime
  readonly teamsActive: boolean
}

const initialState: GameState = {
  difficulty: DIFFICULTY_TYPES.normal,
  roundActive: false,
  roundLength: 600,
  roundRemaining: 600,
  roundStarted: DateTime.now(),
  teamsActive: false,
}

export const gameSlice = createProducer(initialState, {
  setDifficulty: (state, difficulty: Difficulty) => ({
    ...state,
    difficulty,
  }),
  startNewRound: (state) => ({
    ...state,
    roundRemaining: state.roundLength,
    roundStarted: DateTime.now(),
  }),
  setRoundRemaining: (state, remaining: number) => ({
    ...state,
    roundRemaining: remaining,
  }),
})
