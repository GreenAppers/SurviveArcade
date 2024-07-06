import { createProducer } from '@rbxts/reflex'
import { Players } from '@rbxts/services'
import {
  IS_STUDIO,
  TYCOON_TYPES,
} from 'ReplicatedStorage/shared/constants/core'
import { mapProperties } from 'ReplicatedStorage/shared/utils/object'
import { isNPCId } from 'ReplicatedStorage/shared/utils/player'

export enum GamePass {
  ArcadeGun = '806588971',
}

export enum Product {
  Dollars1000 = '1825724409',
  Levity10 = '1825722222',
  NukeServer = '1710612154',
  Tickets2500 = '1825725223',
}

export interface PlayerSettings {
  readonly guide: boolean
  readonly music: boolean
}

export type PlayerTycoonButtons = {
  readonly [buttonName: string]: boolean
}

export interface PlayerTycoon {
  readonly name: string
  readonly buttons: PlayerTycoonButtons
}

export interface PlayerCompleted {
  readonly loops: number
  readonly tables: number
}

export interface PlayerArcadeTable {
  readonly level: number
  readonly highScore: number
  readonly completed: PlayerCompleted
}

export type PlayerArcadeTables = {
  readonly [tableType in ArcadeTableType]: PlayerArcadeTable
}

export type PlayerGamePasses = {
  readonly [gamePass in GamePass]: GamePassData
}

export type PlayerProducts = {
  readonly [product in Product]: ProductData
}

export type PlayerTycoons = {
  readonly [tycoonType in TycoonType]: PlayerTycoon
}

export interface GamePassData {
  active: boolean
}

export interface ProductData {
  timesPurchased: number
}

export interface PlayerData {
  readonly tickets: number
  readonly dollars: number
  readonly levity: number
  readonly KOs: number
  readonly settings: PlayerSettings
  readonly arcadeTable: PlayerArcadeTables
  readonly tycoon: PlayerTycoons
  readonly completed: PlayerCompleted
  readonly gamePasses: Partial<PlayerGamePasses>
  readonly products: Partial<PlayerProducts>
  readonly receiptHistory: string[]
}

export interface PlayerDetail {
  readonly gravityUp: Vector3
  readonly groundArcadeTableName: ArcadeTableName | undefined
  readonly groundArcadeTableSequence: number | undefined
  readonly KOd: number
  readonly name: string
  readonly sessionStartTime: number
  readonly scale: TycoonType
  readonly score: number
  readonly tablePlays: number
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

export const defaultPlayerArcadeTable: PlayerArcadeTable = {
  level: 0,
  highScore: 0,
  completed: defaultPlayerCompleted,
} as const

export const defaultPlayerData: PlayerData = {
  tickets: 0,
  dollars: 0,
  levity: 0,
  KOs: 0,
  settings: defaultPlayerSettings,
  arcadeTable: {
    Pinball: defaultPlayerArcadeTable,
    AirHockey: defaultPlayerArcadeTable,
    Foosball: defaultPlayerArcadeTable,
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
  gamePasses: {},
  products: {},
  receiptHistory: [],
} as const

export const defaultPlayerDetail: PlayerDetail = {
  gravityUp: new Vector3(0, 1, 0),
  groundArcadeTableName: undefined,
  groundArcadeTableSequence: undefined,
  KOd: 0,
  name: '',
  sessionStartTime: 0,
  scale: TYCOON_TYPES.Elf,
  score: 0,
  tablePlays: 0,
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
  KOs: state.KOs,
  settings: state.settings,
  arcadeTable: state.arcadeTable,
  tycoon: state.tycoon,
  completed: state.completed,
  gamePasses: state.gamePasses,
  products: state.products,
  receiptHistory: state.receiptHistory,
})

export function getPlayerDataCurrencyKey(currency: Currency) {
  switch (currency) {
    case 'Dollars':
      return 'dollars'
    case 'Tickets':
      return 'tickets'
    case 'Levity':
      return 'levity'
  }
}

export const getPlayerCurrency = (
  playerState: PlayerState | undefined,
  currency: Currency,
) => playerState?.[getPlayerDataCurrencyKey(currency)] || 0

export const getPlayerGamePass = (
  playerState: PlayerState | undefined,
  gamePassId: GamePass,
) => playerState?.gamePasses?.[gamePassId]?.active ?? false

const getPlayerKey = (userID: number) => KEY_TEMPLATE.format(userID)

export const getPlayerState = (state: Players, userID: number) =>
  state[getPlayerKey(userID)]

export const playersSlice = createProducer(initialState, {
  addNPC: (state, userID: number, name: string) => {
    if (!isNPCId(userID)) throw 'Invalid NPC userId'
    const playerKey = getPlayerKey(userID)
    const playerState = state[playerKey]
    return {
      ...state,
      [playerKey]: {
        ...defaultPlayerData,
        ...defaultPlayerState,
        ...playerState,
        ...defaultPlayerDetail,
        dollars: 10,
        name,
        sessionStartTime: os.time(),
      },
    }
  },

  loadPlayerData: (state, userID: number, name: string, data: PlayerData) => {
    if (isNPCId(userID) && !IS_STUDIO) throw 'Invalid player userId'
    const playerKey = getPlayerKey(userID)
    const playerState = state[playerKey]
    return {
      ...state,
      [playerKey]: {
        ...defaultPlayerState,
        ...playerState,
        ...data,
        ...defaultPlayerDetail,
        name,
        sessionStartTime: os.time(),
      },
    }
  },

  closePlayerData: (state, userID: number) => ({
    ...state,
    [getPlayerKey(userID)]: undefined,
  }),

  addPlayerCurrency: (
    state,
    userID: number,
    currency: Currency,
    amount: number,
  ) => {
    const playerKey = getPlayerKey(userID)
    const playerState = state[playerKey]
    const currencyField = getPlayerDataCurrencyKey(currency)
    const playerCurrency = playerState?.[currencyField] || 0
    if (!playerState || (amount < 0 && playerCurrency < math.abs(amount)))
      return state
    return {
      ...state,
      [playerKey]: {
        ...playerState,
        [currencyField]: math.max(0, playerCurrency + (amount || 0)),
      },
    }
  },

  addPlayerKOd: (state, userID: number, amount: number) => {
    const playerKey = getPlayerKey(userID)
    const playerState = state[playerKey]
    const playerKOd = playerState?.KOd || 0
    if (!playerState) return state
    return {
      ...state,
      [playerKey]: {
        ...playerState,
        KOd: math.max(0, playerKOd + (amount || 0)),
      },
    }
  },

  addPlayerKOs: (state, userID: number, amount: number) => {
    const playerKey = getPlayerKey(userID)
    const playerState = state[playerKey]
    const playerKOs = playerState?.KOs || 0
    if (!playerState) return state
    return {
      ...state,
      [playerKey]: {
        ...playerState,
        KOs: math.max(0, playerKOs + (amount || 0)),
      },
    }
  },

  addPlayerLoops: (
    state,
    userID: number,
    tableType: ArcadeTableType,
    amount: number,
  ) => {
    const playerKey = getPlayerKey(userID)
    const playerState = state[playerKey]
    if (!playerState) return state
    const completed = playerState.completed
    const tableState = playerState.arcadeTable[tableType]
    return {
      ...state,
      [playerKey]: {
        ...playerState,
        levity: math.max(0, playerState.levity + 1),
        completed: {
          ...completed,
          loops: (completed?.loops || 0) + (amount || 0),
        },
        arcade: {
          ...playerState.arcadeTable,
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

  addPlayerScore: (
    state,
    userID: number,
    tableType: ArcadeTableType,
    amount: number,
  ) => {
    const playerKey = getPlayerKey(userID)
    const playerState = state[playerKey]
    if (!playerState) return state
    const newScore = math.max(0, (playerState?.score || 0) + (amount || 0))
    const tableState = playerState.arcadeTable[tableType]
    return {
      ...state,
      [playerKey]: {
        ...playerState,
        score: newScore,
        arcade: {
          ...playerState.arcadeTable,
          [tableType]: {
            ...tableState,
            highScore: math.max(tableState?.highScore || 0, newScore),
          },
        },
      },
    }
  },

  addPlayerTablePlays: (state, userID: number) => {
    const playerKey = getPlayerKey(userID)
    const playerState = state[playerKey]
    if (!playerState) return state
    return {
      ...state,
      [playerKey]: {
        ...playerState,
        tablePlays: playerState.tablePlays + 1,
      },
    }
  },

  resetPlayerScore: (state, userID: number) => {
    const playerKey = getPlayerKey(userID)
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

  purchaseTycoonButton: (
    state,
    userID: number,
    tycoonType: TycoonType,
    buttonName: string,
    currency: Currency,
    amount: number,
  ) => {
    const playerKey = getPlayerKey(userID)
    const playerState = state[playerKey]
    const currencyField = getPlayerDataCurrencyKey(currency)
    const playerCurrency = playerState?.[currencyField] || 0
    if (
      !playerState ||
      amount < 0 ||
      playerCurrency < amount ||
      playerState.tycoon[tycoonType]?.buttons?.[buttonName]
    ) {
      return state
    }
    return {
      ...state,
      [playerKey]: {
        ...playerState,
        [currencyField]: math.max(0, playerCurrency - amount),
        tycoon: {
          ...playerState.tycoon,
          [tycoonType]: {
            ...playerState.tycoon[tycoonType],
            buttons: {
              ...playerState.tycoon[tycoonType].buttons,
              [buttonName]: true,
            },
          },
        },
      },
    }
  },

  purchaseDeveloperProduct: (
    state,
    userId: number,
    productId: Product,
    purchaseId: string,
  ) => {
    const playerKey = getPlayerKey(userId)
    const playerState = state[playerKey]
    if (!playerState || playerState.receiptHistory.includes(purchaseId))
      return state
    const receiptHistory = [...playerState.receiptHistory, purchaseId]
    while (receiptHistory.size() > 50) receiptHistory.shift()
    return {
      ...state,
      [playerKey]: {
        ...playerState,
        products: {
          ...playerState.products,
          [productId]: {
            timesPurchased:
              (playerState.products[productId]?.timesPurchased || 0) + 1,
          },
        },
        receiptHistory,
      },
    }
  },

  setGamePassOwned: (state, userID: number, gamePassId: GamePass) => {
    const playerKey = getPlayerKey(userID)
    const playerState = state[playerKey]
    if (!playerState || playerState.gamePasses[gamePassId]?.active) return state
    return {
      ...state,
      [playerKey]: {
        ...playerState,
        gamePasses: {
          ...playerState.gamePasses,
          [gamePassId]: { active: true },
        },
      },
    }
  },

  resetPlayerScores: (state) =>
    mapProperties(state, (playerState) => ({
      ...playerState,
      score: 0,
    })),

  updateGround: (
    state,
    playerGround: Array<{
      userID: number
      gravityUp: Vector3 | undefined
      groundArcadeTableName: ArcadeTableName | undefined
      groundArcadeTableSequence: number | undefined
    }>,
  ) => {
    let newState: { [playerKey: string]: PlayerState | undefined } | undefined
    for (const {
      userID,
      gravityUp,
      groundArcadeTableName,
      groundArcadeTableSequence,
    } of playerGround) {
      const playerKey = getPlayerKey(userID)
      const playerState = state[playerKey]
      if (
        !playerState ||
        (playerState.groundArcadeTableName === groundArcadeTableName &&
          playerState.groundArcadeTableSequence === groundArcadeTableSequence)
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
    const playerKey = getPlayerKey(userID)
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
