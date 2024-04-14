import Object from '@rbxts/object-utils'
import { createProducer } from '@rbxts/reflex'
import { ARCADE_TABLE_TYPES } from 'ReplicatedStorage/shared/constants/core'

export enum ArcadeTableStatus {
  Unmaterialized,
  Active,
  Won,
}

export enum ArcadeTableScoreDomain {
  Table,
  Player,
}

export interface ArcadeTableArcadeTable {
  highScore: number
}

export interface ArcadeTableState {
  readonly owner?: Player
  readonly tableName: ArcadeTableName
  readonly tableMap: ArcadeTableMap
  readonly tableType: ArcadeTableType
  readonly teamName?: TeamName
  readonly color: BrickColor
  readonly baseColor: BrickColor
  readonly baseMaterial: Enum.Material
  readonly statorColor: BrickColor
  readonly score: number
  readonly scoreDomain: number
  readonly scoreStart: number
  readonly scoreToWin: number
  readonly arcadeTable: {
    readonly [tableType in ArcadeTableType]: ArcadeTableArcadeTable
  }
  readonly status: ArcadeTableStatus
  readonly sequence: number
}

export type ArcadeTablesState = {
  readonly [arcadeTableName in ArcadeTableName]: ArcadeTableState
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

export const initialScoreToWin = 50000

export const defaultArcadeTableArcadeTable: ArcadeTableArcadeTable = {
  highScore: 0,
}

export const defaultArcadeTableState = {
  owner: undefined,
  score: 0,
  scoreDomain: ArcadeTableScoreDomain.Table,
  scoreStart: 0,
  scoreToWin: initialScoreToWin,
  arcadeTable: {
    Pinball: defaultArcadeTableArcadeTable,
    Foosball: defaultArcadeTableArcadeTable,
    AirHockey: defaultArcadeTableArcadeTable,
  },
  status: ArcadeTableStatus.Active,
  nextStatus: ArcadeTableStatus.Unmaterialized,
  sequence: 0,
}

const initialState: ArcadeTablesState = {
  Table1: {
    ...defaultArcadeTableState,
    tableName: 'Table1',
    tableMap: 'Pinball1',
    tableType: ARCADE_TABLE_TYPES.Pinball,
    teamName: 'Blue Team',
    color: new BrickColor('Cyan'),
    statorColor: new BrickColor('Electric blue'),
    baseColor: new BrickColor('Pastel Blue'),
    baseMaterial: Enum.Material.Glass,
  },
  Table2: {
    ...defaultArcadeTableState,
    tableName: 'Table2',
    tableMap: 'Pinball1',
    tableType: ARCADE_TABLE_TYPES.Pinball,
    teamName: 'Green Team',
    color: new BrickColor('Lime green'),
    statorColor: new BrickColor('Forest green'),
    baseColor: new BrickColor('Sand green'),
    baseMaterial: Enum.Material.Glass,
  },
  Table3: {
    ...defaultArcadeTableState,
    tableName: 'Table3',
    tableMap: 'Pinball1',
    tableType: ARCADE_TABLE_TYPES.Pinball,
    teamName: 'Yellow Team',
    color: new BrickColor('Deep orange'),
    statorColor: new BrickColor('Neon orange'),
    baseColor: new BrickColor('Cork'),
    baseMaterial: Enum.Material.Glass,
  },
  Table4: {
    ...defaultArcadeTableState,
    tableName: 'Table4',
    tableMap: 'Pinball1',
    tableType: ARCADE_TABLE_TYPES.Pinball,
    teamName: 'Red Team',
    color: new BrickColor('Really red'),
    statorColor: new BrickColor('Crimson'),
    baseColor: new BrickColor('Terra Cotta'),
    baseMaterial: Enum.Material.Glass,
  },
}

export const arcadeTablesSlice = createProducer(initialState, {
  claimArcadeTable: (state, name: ArcadeTableName, owner?: Player) => {
    const prevTable = state[name]
    return !prevTable || prevTable.owner === owner || (owner && prevTable.owner)
      ? state
      : {
          ...state,
          [name]: { ...prevTable, owner, score: 0 },
        }
  },

  updateArcadeTableStatus: (
    state,
    name: ArcadeTableName,
    status: ArcadeTableStatus,
  ) =>
    state[name]?.status !== status
      ? {
          ...state,
          [name]: { ...state[name], status },
        }
      : state,

  extendArcadeTable: (state, name: ArcadeTableName) => {
    const lastState = state[name]
    const lastScoreToWin = lastState?.scoreToWin || initialScoreToWin
    const nextScoreToWin = lastScoreToWin // + initialScoreToWin // * 3
    const lastSequence = lastState?.sequence || 0
    const nextSequence = lastSequence + 1
    return {
      ...state,
      [name]: {
        ...initialState[name],
        scoreToWin: nextScoreToWin,
        sequence: nextSequence,
        nextStatus: ArcadeTableStatus.Active,
      },
    }
  },

  resetArcadeTable: (state, name: ArcadeTableName) => ({
    ...state,
    [name]: { ...initialState[name] },
  }),

  resetArcadeTables: () => ({ ...initialState }),

  addArcadeTableScore: (state, name: ArcadeTableName, amount: number) => {
    const lastState = state[name]
    if (!lastState) return state
    const tableState = lastState.arcadeTable[lastState.tableType]
    const newScore = (lastState?.score || 0) + (amount || 0)
    return {
      ...state,
      [name]: {
        ...lastState,
        score: newScore,
        arcadeTable: {
          ...lastState.arcadeTable,
          [lastState.tableType]: {
            ...tableState,
            highScore: math.max(tableState?.highScore || 0, newScore),
          },
        },
      },
    }
  },
})
