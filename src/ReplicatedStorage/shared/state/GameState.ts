import { createProducer } from '@rbxts/reflex'

export interface GameState {
  readonly roundLength: number
  readonly roundRemaining: number
  readonly roundStarted: DateTime
}

const initialState: GameState = {
  roundLength: 600,
  roundRemaining: 600,
  roundStarted: DateTime.now(),
}

export const gameSlice = createProducer(initialState, {
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
