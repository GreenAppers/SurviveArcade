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
  claimArcadeTable: (state, name: ArcadeTableName, owner?: Player) => {
    const prevTable = state[name]
    return !prevTable || prevTable.owner === owner || (owner && prevTable.owner)
      ? state
      : {
          ...state,
          [name]: { ...prevTable, owner },
        }
  },
})
