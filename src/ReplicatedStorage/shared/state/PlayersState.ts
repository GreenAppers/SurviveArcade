import { createProducer } from '@rbxts/reflex'
import { mapProperties } from 'ReplicatedStorage/shared/utils/object'

export interface PlayerData {
  readonly guide: boolean
  readonly music: boolean
}

export interface PlayerScore {
  readonly score: number
  readonly highScore: number
  readonly loops: number
}

export interface PlayerState extends PlayerData {
  readonly gravityUp: Vector3
  readonly groundArcadeTableName:
    | ArcadeTableName
    | ArcadeTableNextName
    | undefined
  readonly score: PlayerScore
}

export type PlayerDataType = keyof PlayerData
export type PlayerStateType = keyof PlayerState
export type PlayerScoreType = keyof PlayerScore

export interface PlayersState {
  readonly [playerKey: string]: PlayerState | undefined
}

export const defaultPlayerData = {
  guide: true,
  music: true,
}

export const defaultPlayerState = {
  ...defaultPlayerData,
  gravityUp: new Vector3(0, 1, 0),
  groundArcadeTableName: undefined,
  score: {
    score: 0,
    highScore: 0,
    loops: 0,
  },
}

const KEY_TEMPLATE = '%d'
const initialState: PlayersState = {}

export const getPlayerData = (state: PlayerState): PlayerData => ({
  guide: state.guide,
  music: state.music,
})

export const getPlayer = (state: PlayersState, userID: number) =>
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
        score: { ...defaultPlayerState.score, ...playerState?.score },
      },
    }
  },

  closePlayerData: (state, userID: number) => ({
    ...state,
    [KEY_TEMPLATE.format(userID)]: undefined,
  }),

  addLoops: (state, userID: number, amount: number) => {
    const playerKey = KEY_TEMPLATE.format(userID)
    const playerState = state[playerKey]
    const scoreState = playerState?.score
    return {
      ...state,
      [playerKey]: {
        ...(playerState ?? defaultPlayerState),
        score: {
          ...scoreState,
          score: scoreState?.score || 0,
          highScore: scoreState?.highScore || 0,
          loops: (scoreState?.loops || 0) + (amount || 0),
        },
      },
    }
  },

  addScore: (state, userID: number, amount: number) => {
    const playerKey = KEY_TEMPLATE.format(userID)
    const playerState = state[playerKey]
    const scoreState = playerState?.score
    const newScore = (scoreState?.score || 0) + (amount || 0)
    return {
      ...state,
      [playerKey]: {
        ...(playerState ?? defaultPlayerState),
        score: {
          ...scoreState,
          score: newScore,
          highScore: math.max(scoreState?.highScore || 0, newScore),
          loops: scoreState?.loops || 0,
        },
      },
    }
  },

  resetScore: (state, userID: number) => {
    const playerKey = KEY_TEMPLATE.format(userID)
    const playerState = state[playerKey]
    const scoreState = playerState?.score
    return {
      ...state,
      [playerKey]: {
        ...(playerState ?? defaultPlayerState),
        score: {
          ...scoreState,
          score: 0,
          highScore: scoreState?.highScore || 0,
          loops: scoreState?.loops || 0,
        },
      },
    }
  },

  resetScores: (state) =>
    mapProperties(state, (playerState) => ({
      ...playerState,
      score: { ...defaultPlayerState.score },
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
        gravityUp: gravityUp || defaultPlayerState.gravityUp,
        groundArcadeTableName: groundArcadeTableName,
      }
    }
    return newState || state
  },

  toggleGuide: (state, userID: number) => {
    const playerKey = KEY_TEMPLATE.format(userID)
    const playerState = state[playerKey]
    return {
      ...state,
      [playerKey]: {
        ...(playerState ?? defaultPlayerState),
        guide: !playerState?.guide,
      },
    }
  },
})
