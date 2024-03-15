import Object from '@rbxts/object-utils'
import { createProducer } from '@rbxts/reflex'
import {
  ARCADE_TABLE_NAMES,
  ARCADE_TABLE_NEXT_NAMES,
  ARCADE_TABLE_TYPES,
} from 'ReplicatedStorage/shared/constants/core'

export enum ArcadeTableStatus {
  Unmaterialized,
  Active,
  Won,
}

export interface ArcadeTableState {
  readonly owner?: Player
  readonly teamName?: TeamName
  readonly tableMap: ArcadeTableMap
  readonly tableType: ArcadeTableType
  readonly color: BrickColor
  readonly baseColor: BrickColor
  readonly baseMaterial: Enum.Material
  readonly statorColor: BrickColor
  readonly scoreToWin: number
  readonly status: ArcadeTableStatus
  readonly sequence: number
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
    case ARCADE_TABLE_NAMES[0]:
    case ARCADE_TABLE_NAMES[1]:
    case ARCADE_TABLE_NAMES[2]:
    case ARCADE_TABLE_NAMES[3]:
      return tableName
    default:
      return undefined
  }
}

export const isArcadeTableNextName = (
  tableName: ArcadeTableName | ArcadeTableNextName,
): ArcadeTableNextName | undefined => {
  switch (tableName) {
    case ARCADE_TABLE_NEXT_NAMES[0]:
    case ARCADE_TABLE_NEXT_NAMES[1]:
    case ARCADE_TABLE_NEXT_NAMES[2]:
    case ARCADE_TABLE_NEXT_NAMES[3]:
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

export const initialScoreToWin = 10000

const initialState: ArcadeTablesState = {
  Table1: {
    owner: undefined,
    teamName: 'Blue Team',
    tableMap: 'Pinball1',
    tableType: ARCADE_TABLE_TYPES.Pinball,
    color: new BrickColor('Cyan'),
    statorColor: new BrickColor('Electric blue'),
    baseColor: new BrickColor('Pastel Blue'),
    baseMaterial: Enum.Material.Glass,
    scoreToWin: initialScoreToWin,
    status: ArcadeTableStatus.Active,
    sequence: 0,
  },
  Table2: {
    owner: undefined,
    teamName: 'Green Team',
    tableMap: 'Pinball1',
    tableType: ARCADE_TABLE_TYPES.Pinball,
    color: new BrickColor('Lime green'),
    statorColor: new BrickColor('Forest green'),
    baseColor: new BrickColor('Sand green'),
    baseMaterial: Enum.Material.Glass,
    scoreToWin: initialScoreToWin,
    status: ArcadeTableStatus.Active,
    sequence: 0,
  },
  Table3: {
    owner: undefined,
    teamName: 'Yellow Team',
    tableMap: 'Pinball1',
    tableType: ARCADE_TABLE_TYPES.Pinball,
    color: new BrickColor('Deep orange'),
    statorColor: new BrickColor('Neon orange'),
    baseColor: new BrickColor('Cork'),
    baseMaterial: Enum.Material.Glass,
    scoreToWin: initialScoreToWin,
    status: ArcadeTableStatus.Active,
    sequence: 0,
  },
  Table4: {
    owner: undefined,
    teamName: 'Red Team',
    tableMap: 'Pinball1',
    tableType: ARCADE_TABLE_TYPES.Pinball,
    color: new BrickColor('Really red'),
    statorColor: new BrickColor('Crimson'),
    baseColor: new BrickColor('Terra Cotta'),
    baseMaterial: Enum.Material.Glass,
    scoreToWin: initialScoreToWin,
    status: ArcadeTableStatus.Active,
    sequence: 0,
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
    const lastState = state[name]
    const lastScoreToWin = lastState?.scoreToWin || initialScoreToWin
    const nextScoreToWin = lastScoreToWin + initialScoreToWin // * 3
    const lastSequence = lastState?.sequence || 0
    const nextSequence = lastSequence + 1
    if (isArcadeTableBaseName(name)) {
      // We're extending the inital table.
      const nextTable = state[nextName]
      return nextTable
        ? state
        : {
            ...state,
            [nextName]: {
              ...initialState[name],
              scoreToWin: nextScoreToWin,
              sequence: nextSequence,
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
          scoreToWin: nextScoreToWin,
          sequence: nextSequence,
          status: ArcadeTableStatus.Unmaterialized,
        },
      }
    }
  },

  resetArcadeTable: (state, name: ArcadeTableName) => {
    const nextName = nextArcadeTableName(name)
    return {
      ...state,
      [name]: { ...initialState[name] },
      [nextName]: initialState[nextName],
    }
  },

  resetArcadeTables: () => ({ ...initialState }),
})
