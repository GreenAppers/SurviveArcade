import { createProducer } from '@rbxts/reflex'

export interface ArcadeTableState {
  readonly owner?: Player
}

export interface ArcadeTablesState {
  readonly [arcadeTableName: string]: ArcadeTableState | undefined
}

const initialState: ArcadeTablesState = {
  Table1: { owner: undefined },
  Table2: { owner: undefined },
  Table3: { owner: undefined },
  Table4: { owner: undefined },
}

export type ArcadeTableName = keyof ArcadeTablesState

export const arcadeTablesSlice = createProducer(initialState, {
  claimArcadeTable: (state, name: ArcadeTableName, owner?: Player) => 
    state[name]?.owner === owner
      ? state
      : state[name]
        ? {
            ...state,
            [name]: { ...state[name], owner },
          }
        : state,
})
