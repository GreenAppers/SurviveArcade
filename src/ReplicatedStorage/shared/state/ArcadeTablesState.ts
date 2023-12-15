import { createProducer } from '@rbxts/reflex'

export interface ArcadeTableState {
  readonly owner?: Player
  readonly tableType?: ArcadeTableType
  readonly teamName?: TeamName
  readonly color: BrickColor
  readonly baseColor: BrickColor
  readonly baseMaterial: Enum.Material
  readonly statorColor: BrickColor
}

export type ArcadeTablesState = {
  readonly [arcadeTableName in ArcadeTableName]: ArcadeTableState
}

const initialState: ArcadeTablesState = {
  Table1: {
    owner: undefined,
    tableType: 'Pinball1',
    teamName: 'Blue Team',
    color: new BrickColor('Cyan'),
    statorColor: new BrickColor('Electric blue'),
    baseColor: new BrickColor('Pastel Blue'),
    baseMaterial: Enum.Material.Glass,
  },
  Table2: {
    owner: undefined,
    tableType: 'Pinball1',
    teamName: 'Green Team',
    color: new BrickColor('Lime green'),
    statorColor: new BrickColor('Forest green'),
    baseColor: new BrickColor('Sand green'),
    baseMaterial: Enum.Material.Glass,
  },
  Table3: {
    owner: undefined,
    tableType: 'Pinball1',
    teamName: 'Yellow Team',
    color: new BrickColor('Deep orange'),
    statorColor: new BrickColor('Neon orange'),
    baseColor: new BrickColor('Cork'),
    baseMaterial: Enum.Material.Glass,
  },
  Table4: {
    owner: undefined,
    tableType: 'Pinball1',
    teamName: 'Red Team',
    color: new BrickColor('Really red'),
    statorColor: new BrickColor('Crimson'),
    baseColor: new BrickColor('Terra Cotta'),
    baseMaterial: Enum.Material.Glass,
  },
}

export const arcadeTablesSlice = createProducer(initialState, {
  claimArcadeTable: (state, name: ArcadeTableName, owner?: Player) => {
    if (!name) return state
    const prevTable = state[name]
    return !prevTable || prevTable.owner === owner || (owner && prevTable.owner)
      ? state
      : {
          ...state,
          [name]: { ...prevTable, owner },
        }
  },
})
