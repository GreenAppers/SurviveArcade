import Object from '@rbxts/object-utils'
import { createProducer } from '@rbxts/reflex'

export enum ArcadeTableStatus {
  Unmaterialized,
  Active,
  Won,
}

export interface ArcadeTableState {
  readonly owner?: Player
  readonly tableType?: ArcadeTableType
  readonly teamName?: TeamName
  readonly color: BrickColor
  readonly baseColor: BrickColor
  readonly baseMaterial: Enum.Material
  readonly statorColor: BrickColor
  readonly scoreToWin: number
  readonly status: ArcadeTableStatus
}

export type ArcadeTablesState = {
  readonly [arcadeTableName in ArcadeTableName | ArcadeTableNextName]:
    | ArcadeTableState
    | undefined
}

export const isArcadeTableBaseName = (
  tableName: ArcadeTableName | ArcadeTableNextName,
): ArcadeTableName | undefined => {
  switch (tableName) {
    case 'Table1':
    case 'Table2':
    case 'Table3':
    case 'Table4':
      return tableName
    default:
      return undefined
  }
}

export const isArcadeTableNextName = (
  tableName: ArcadeTableName | ArcadeTableNextName,
): ArcadeTableNextName | undefined => {
  switch (tableName) {
    case 'Table1Next':
    case 'Table2Next':
    case 'Table3Next':
    case 'Table4Next':
      return tableName
    default:
      return undefined
  }
}

export const baseArcadeTableName = (
  tableName: ArcadeTableName | ArcadeTableNextName,
): ArcadeTableName => {
  switch (tableName) {
    case 'Table1':
    case 'Table1Next':
      return 'Table1'
    case 'Table2':
    case 'Table2Next':
      return 'Table2'
    case 'Table3':
    case 'Table3Next':
      return 'Table3'
    case 'Table4':
    case 'Table4Next':
      return 'Table4'
  }
}

export const nextArcadeTableName = (
  tableName: ArcadeTableName | ArcadeTableNextName,
): ArcadeTableNextName => {
  switch (tableName) {
    case 'Table1':
    case 'Table1Next':
      return 'Table1Next'
    case 'Table2':
    case 'Table2Next':
      return 'Table2Next'
    case 'Table3':
    case 'Table3Next':
      return 'Table3Next'
    case 'Table4':
    case 'Table4Next':
      return 'Table4Next'
  }
}

export const findArcadeTableNameOwnedBy = (
  arcadeTablesState: ArcadeTablesState,
  userId: number,
) =>
  Object.entries(arcadeTablesState).find(
    ([_name, arcadeTable]) => arcadeTable?.owner?.UserId === userId,
  )?.[0] as ArcadeTableName | undefined

const initialScoreToWin = 10000

const initialState: ArcadeTablesState = {
  Table1: {
    owner: undefined,
    tableType: 'Pinball1',
    teamName: 'Blue Team',
    color: new BrickColor('Cyan'),
    statorColor: new BrickColor('Electric blue'),
    baseColor: new BrickColor('Pastel Blue'),
    baseMaterial: Enum.Material.Glass,
    scoreToWin: initialScoreToWin,
    status: ArcadeTableStatus.Active,
  },
  Table2: {
    owner: undefined,
    tableType: 'Pinball1',
    teamName: 'Green Team',
    color: new BrickColor('Lime green'),
    statorColor: new BrickColor('Forest green'),
    baseColor: new BrickColor('Sand green'),
    baseMaterial: Enum.Material.Glass,
    scoreToWin: initialScoreToWin,
    status: ArcadeTableStatus.Active,
  },
  Table3: {
    owner: undefined,
    tableType: 'Pinball1',
    teamName: 'Yellow Team',
    color: new BrickColor('Deep orange'),
    statorColor: new BrickColor('Neon orange'),
    baseColor: new BrickColor('Cork'),
    baseMaterial: Enum.Material.Glass,
    scoreToWin: initialScoreToWin,
    status: ArcadeTableStatus.Active,
  },
  Table4: {
    owner: undefined,
    tableType: 'Pinball1',
    teamName: 'Red Team',
    color: new BrickColor('Really red'),
    statorColor: new BrickColor('Crimson'),
    baseColor: new BrickColor('Terra Cotta'),
    baseMaterial: Enum.Material.Glass,
    scoreToWin: initialScoreToWin,
    status: ArcadeTableStatus.Active,
  },
  Table1Next: undefined,
  Table2Next: undefined,
  Table3Next: undefined,
  Table4Next: undefined,
}

export const arcadeTablesSlice = createProducer(initialState, {
  claimArcadeTable: (
    state,
    name: ArcadeTableName | ArcadeTableNextName,
    owner?: Player,
  ) => {
    const prevTable = state[name]
    return !prevTable || prevTable.owner === owner || (owner && prevTable.owner)
      ? state
      : {
          ...state,
          [name]: { ...prevTable, owner },
        }
  },

  updateArcadeTableStatus: (
    state,
    name: ArcadeTableName | ArcadeTableNextName,
    status: ArcadeTableStatus,
  ) =>
    state[name]?.status !== status
      ? {
          ...state,
          [name]: { ...state[name], status },
        }
      : state,

  extendArcadeTable: (state, name: ArcadeTableName | ArcadeTableNextName) => {
    const nextName = nextArcadeTableName(name)
    if (isArcadeTableBaseName(name)) {
      // We're extending the inital table.
      const nextTable = state[nextName]
      return nextTable
        ? state
        : {
            ...state,
            [nextName]: {
              ...initialState[name],
              scoreToWin: (state[name]?.scoreToWin || initialScoreToWin) * 2,
              status: ArcadeTableStatus.Unmaterialized,
            },
          }
    } else {
      // We're extending the current "next" table.
      const baseName = baseArcadeTableName(name)
      return {
        ...state,
        // Replace the base table with the current next table.
        [baseName]: state[name] || { ...initialState[baseName] },
        // Create a new next table.
        [nextName]: {
          ...initialState[baseName],
          scoreToWin: (state[name]?.scoreToWin || initialScoreToWin) * 2,
          status: ArcadeTableStatus.Unmaterialized,
        },
      }
    }
  },

  resetArcadeTables: () => ({ ...initialState }),
})
