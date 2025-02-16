import Object from '@rbxts/object-utils'
import { createProducer } from '@rbxts/reflex'
import {
  firstArcadeTableMap,
  nextArcadeTableType,
  randomArcadeTableType,
} from 'ReplicatedStorage/shared/utils/arcade'

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
  readonly owner: number
  readonly tableName: ArcadeTableName
  readonly tableMap: ArcadeTableMap
  readonly tableType: ArcadeTableType
  readonly nextTableType: ArcadeTableType
  readonly teamName?: TeamName
  readonly color: BrickColor
  readonly baseColor: BrickColor
  readonly baseMaterial: Enum.Material
  readonly statorColor: BrickColor
  readonly goalsHome: number
  readonly goalsAway: number
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
    ([_name, arcadeTable]) => arcadeTable?.owner === userId,
  )?.[0] as ArcadeTableName | undefined

export const initialScoreToWin = 10000

export const defaultArcadeTableArcadeTable: ArcadeTableArcadeTable = {
  highScore: 0,
}

export const defaultArcadeTableState = {
  owner: 0,
  goalsHome: 0,
  goalsAway: 0,
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

const initialTableType = {
  Table1: randomArcadeTableType(),
  Table2: randomArcadeTableType(),
  Table3: randomArcadeTableType(),
  Table4: randomArcadeTableType(),
}

const initialState: ArcadeTablesState = {
  Table1: {
    ...defaultArcadeTableState,
    tableName: 'Table1',
    tableMap: firstArcadeTableMap(initialTableType.Table1),
    tableType: initialTableType.Table1,
    nextTableType: randomArcadeTableType(initialTableType.Table1),
    teamName: 'Blue Team',
    color: new BrickColor('Cyan'),
    statorColor: new BrickColor('Electric blue'),
    baseColor: new BrickColor('Pastel Blue'),
    baseMaterial: Enum.Material.Glass,
  },
  Table2: {
    ...defaultArcadeTableState,
    tableName: 'Table2',
    tableMap: firstArcadeTableMap(initialTableType.Table2),
    tableType: initialTableType.Table2,
    nextTableType: randomArcadeTableType(initialTableType.Table2),
    teamName: 'Green Team',
    color: new BrickColor('Lime green'),
    statorColor: new BrickColor('Forest green'),
    baseColor: new BrickColor('Sand green'),
    baseMaterial: Enum.Material.Glass,
  },
  Table3: {
    ...defaultArcadeTableState,
    tableName: 'Table3',
    tableMap: firstArcadeTableMap(initialTableType.Table3),
    tableType: initialTableType.Table3,
    nextTableType: randomArcadeTableType(initialTableType.Table3),
    teamName: 'Yellow Team',
    color: new BrickColor('Deep orange'),
    statorColor: new BrickColor('Neon orange'),
    baseColor: new BrickColor('Cork'),
    baseMaterial: Enum.Material.Glass,
  },
  Table4: {
    ...defaultArcadeTableState,
    tableName: 'Table4',
    tableMap: firstArcadeTableMap(initialTableType.Table4),
    tableType: initialTableType.Table4,
    nextTableType: randomArcadeTableType(initialTableType.Table4),
    teamName: 'Red Team',
    color: new BrickColor('Really red'),
    statorColor: new BrickColor('Crimson'),
    baseColor: new BrickColor('Terra Cotta'),
    baseMaterial: Enum.Material.Glass,
  },
}

export const arcadeTablesSlice = createProducer(initialState, {
  changeArcadeTable: (state, name: ArcadeTableName) => {
    const prevTable = state[name]
    if (
      !prevTable ||
      prevTable.owner ||
      prevTable.sequence !== 0 ||
      prevTable.status !== ArcadeTableStatus.Active
    )
      return state
    const tableType = nextArcadeTableType(prevTable.tableType)
    return {
      ...state,
      [name]: {
        ...prevTable,
        tableType,
        tableMap: firstArcadeTableMap(tableType),
      },
    }
  },

  claimArcadeTable: (state, name: ArcadeTableName, owner?: number) => {
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
    const lastSequence = lastState?.sequence || 0
    const nextSequence = lastSequence + 1
    const lastScoreToWin = lastState?.scoreToWin || initialScoreToWin
    const nextScoreToWin =
      nextSequence % 8 === 0 ? initialScoreToWin : lastScoreToWin + 5000

    return {
      ...state,
      [name]: {
        ...initialState[name],
        scoreToWin: nextScoreToWin,
        sequence: nextSequence,
        tableMap: firstArcadeTableMap(lastState.nextTableType),
        tableType: lastState.nextTableType,
        nextTableType: randomArcadeTableType(lastState.nextTableType),
        nextStatus: ArcadeTableStatus.Active,
      },
    }
  },

  resetArcadeTable: (state, name: ArcadeTableName) => {
    const lastState = state[name]
    return {
      ...state,
      [name]: {
        ...initialState[name],
        tableType: lastState.tableType,
        tableMap: lastState.tableMap,
        nextTableType: randomArcadeTableType(lastState.nextTableType),
      },
    }
  },

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

  addArcadeTableGoals: (
    state,
    name: ArcadeTableName,
    amount: number,
    team?: string,
  ) => {
    const lastState = state[name]
    if (!lastState) return state
    const isTeamAway = team === 'Away'
    const newScore =
      ((isTeamAway ? lastState?.goalsAway : lastState?.goalsHome) || 0) +
      (amount || 0)
    return {
      ...state,
      [name]: {
        ...lastState,
        ...(isTeamAway ? { goalsAway: newScore } : { goalsHome: newScore }),
        score: newScore,
      },
    }
  },
})
