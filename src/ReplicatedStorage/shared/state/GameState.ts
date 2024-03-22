import { createProducer } from '@rbxts/reflex'

export interface GameState {
  readonly roundActive: boolean
  readonly roundLength: number
  readonly roundRemaining: number
  readonly roundStarted: DateTime
  readonly teamsActive: boolean
}

const initialState: GameState = {
  roundActive: false,
  roundLength: 600,
  roundRemaining: 600,
  roundStarted: DateTime.now(),
  teamsActive: false,
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
