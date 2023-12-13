import { createProducer } from '@rbxts/reflex'

export interface PinballTableState {
  readonly owner?: Player
}

export interface PinballTablesState {
  readonly [pinballTableName: string]: PinballTableState | undefined
}

const initialState: PinballTablesState = {
  Pinball1: { owner: undefined },
  Pinball2: { owner: undefined },
  Pinball3: { owner: undefined },
  Pinball4: { owner: undefined },
}

export const pinballTablesSlice = createProducer(initialState, {
  claimPinballTable: (state, name: string, owner?: Player) =>
    state[name]?.owner === owner
      ? state
      : state[name]
        ? {
            ...state,
            [name]: { ...state[name], owner },
          }
        : state,
})
