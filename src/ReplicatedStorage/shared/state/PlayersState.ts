import { createProducer } from '@rbxts/reflex'
import { TYCOON_TYPES } from 'ReplicatedStorage/shared/constants/core'
import { mapProperties } from 'ReplicatedStorage/shared/utils/object'

export interface PlayerSettings {
  readonly guide: boolean
  readonly music: boolean
}

export interface PlayerTycoon {
  readonly name: string
  readonly buttons: {
    readonly [buttonName: string]: boolean
  }
}

export interface PlayerCompleted {
  readonly loops: number
  readonly tables: number
}

export interface PlayerArcade {
  readonly level: number
  readonly highScore: number
  readonly completed: PlayerCompleted
}

export interface PlayerData {
  readonly tickets: number
  readonly dollars: number
  readonly levity: number
  readonly settings: PlayerSettings
  readonly arcade: {
    readonly [tableType in ArcadeTableType]: PlayerArcade
  }
  readonly tycoon: {
    readonly [tycoonType in TycoonType]: PlayerTycoon
  }
  readonly completed: PlayerCompleted
}

export interface PlayerDetail {
  readonly gravityUp: Vector3
  readonly groundArcadeTableName:
    | ArcadeTableName
    | ArcadeTableNextName
    | undefined
  readonly scale: TycoonType
  readonly score: number
}

export interface PlayerState extends PlayerData, PlayerDetail {}

export type PlayerDataType = keyof PlayerData
export type PlayerDetailType = keyof PlayerDetail

export interface Players {
  readonly [playerKey: string]: PlayerState | undefined
}

export const defaultPlayerSettings: PlayerSettings = {
  guide: true,
  music: true,
} as const

export const defaultPlayerCompleted: PlayerCompleted = {
  loops: 0,
  tables: 0,
} as const

export const defaultPlayerArcade: PlayerArcade = {
  level: 0,
  highScore: 0,
  completed: defaultPlayerCompleted,
} as const

export const defaultPlayerData: PlayerData = {
  tickets: 0,
  dollars: 0,
  levity: 0,
  settings: defaultPlayerSettings,
  arcade: {
    Pinball: defaultPlayerArcade,
    AirHockey: defaultPlayerArcade,
    Foosball: defaultPlayerArcade,
  },
  tycoon: {
    Elf: {
      name: TYCOON_TYPES.Elf,
      buttons: {},
    },
    Human: {
      name: TYCOON_TYPES.Human,
      buttons: {},
    },
    Omniverse: {
      name: TYCOON_TYPES.Omniverse,
      buttons: {},
    },
  },
  completed: defaultPlayerCompleted,
} as const

export const defaultPlayerDetail: PlayerDetail = {
  gravityUp: new Vector3(0, 1, 0),
  groundArcadeTableName: undefined,
  scale: TYCOON_TYPES.Elf,
  score: 0,
} as const

export const defaultPlayerState = {
  ...defaultPlayerData,
  ...defaultPlayerDetail,
} as const

const KEY_TEMPLATE = '%d'
const initialState: Players = {}

export const getPlayerData = (state: PlayerState): PlayerData => ({
  tickets: state.tickets,
  dollars: state.dollars,
  levity: state.levity,
  settings: state.settings,
  arcade: state.arcade,
  tycoon: state.tycoon,
  completed: state.completed,
})

export const getPlayer = (state: Players, userID: number) =>
  state[KEY_TEMPLATE.format(userID)]

export const playersSlice = createProducer(initialState, {
  loadPlayerData: (state, userID: number, data: PlayerData) => {
    const playerKey = KEY_TEMPLATE.format(userID)
    const playerState = state[playerKey]
    return {
      ...state,
      [playerKey]: {
        ...defaultPlayerState,
        ...playerState,
        ...data,
        ...defaultPlayerDetail,
      },
    }
  },

  closePlayerData: (state, userID: number) => ({
    ...state,
    [KEY_TEMPLATE.format(userID)]: undefined,
  }),

  addDollars: (state, userID: number, amount: number) => {
    const playerKey = KEY_TEMPLATE.format(userID)
    const playerState = state[playerKey]
    if (!playerState) return state
    return {
      ...state,
      [playerKey]: {
        ...playerState,
        dollars: playerState.dollars + (amount || 0),
      },
    }
  },

  addLoops: (
    state,
    userID: number,
    tableType: ArcadeTableType,
    amount: number,
  ) => {
    const playerKey = KEY_TEMPLATE.format(userID)
    const playerState = state[playerKey]
    if (!playerState) return state
    const completed = playerState.completed
    const tableState = playerState.arcade[tableType]
    return {
      ...state,
      [playerKey]: {
        ...playerState,
        completed: {
          ...completed,
          loops: (completed?.loops || 0) + (amount || 0),
        },
        arcade: {
          ...playerState.arcade,
          [tableType]: {
            ...tableState,
            completed: {
              ...tableState.completed,
              loops: (tableState.completed.loops || 0) + (amount || 0),
            },
          },
        },
      },
    }
  },

  addScore: (
    state,
    userID: number,
    tableType: ArcadeTableType,
    amount: number,
  ) => {
    const playerKey = KEY_TEMPLATE.format(userID)
    const playerState = state[playerKey]
    if (!playerState) return state
    const newScore = (playerState?.score || 0) + (amount || 0)
    const tableState = playerState.arcade[tableType]
    return {
      ...state,
      [playerKey]: {
        ...playerState,
        score: newScore,
        arcade: {
          ...playerState.arcade,
          [tableType]: {
            ...tableState,
            highScore: math.max(tableState?.highScore || 0, newScore),
          },
        },
      },
    }
  },

  resetScore: (state, userID: number) => {
    const playerKey = KEY_TEMPLATE.format(userID)
    const playerState = state[playerKey]
    if (!playerState) return state
    return {
      ...state,
      [playerKey]: {
        ...playerState,
        score: 0,
      },
    }
  },

  resetScores: (state) =>
    mapProperties(state, (playerState) => ({
      ...playerState,
      score: 0,
    })),

  updateGround: (
    state,
    playerGround: Array<{
      userID: number
      gravityUp: Vector3 | undefined
      groundArcadeTableName: ArcadeTableName | ArcadeTableNextName | undefined
    }>,
  ) => {
    let newState: { [playerKey: string]: PlayerState | undefined } | undefined
    for (const { userID, gravityUp, groundArcadeTableName } of playerGround) {
      const playerKey = KEY_TEMPLATE.format(userID)
      const playerState = state[playerKey]
      if (
        !playerState ||
        playerState.groundArcadeTableName === groundArcadeTableName
      )
        continue
      if (!newState) newState = { ...state }
      newState[playerKey] = {
        ...playerState,
        gravityUp: gravityUp || defaultPlayerDetail.gravityUp,
        groundArcadeTableName: groundArcadeTableName,
      }
    }
    return newState || state
  },

  toggleGuide: (state, userID: number) => {
    const playerKey = KEY_TEMPLATE.format(userID)
    const playerState = state[playerKey]
    if (!playerState) return state
    return {
      ...state,
      [playerKey]: {
        ...playerState,
        settings: {
          ...playerState.settings,
          guide: !playerState.settings.guide,
        },
      },
    }
  },
})
