import { Device } from '@rbxts/device'
import { Players, RunService } from '@rbxts/services'
import { $NODE_ENV } from 'rbxts-transform-env'

export const IS_PROD = $NODE_ENV === 'production'
export const IS_CANARY = $NODE_ENV === 'canary'
export const IS_EDIT = RunService.IsStudio() && !RunService.IsRunning()

export const START_PLACE_ID = IS_PROD ? -1 : 15699266223
export const HUMAN_PLACE_ID = IS_PROD ? -1 : 16860946152
export const OMNIVERSE_PLACE_ID = IS_PROD ? -1 : -1

export const IS_HUMAN_PLACE = game.PlaceId === HUMAN_PLACE_ID
export const IS_OMNIVERSE_PLACE = game.PlaceId === OMNIVERSE_PLACE_ID
export const IS_START_PLACE = !IS_HUMAN_PLACE && !IS_OMNIVERSE_PLACE

export const USER_ID = Players.LocalPlayer ? Players.LocalPlayer.UserId : 0
export const USER_NAME = Players.LocalPlayer
  ? Players.LocalPlayer.Name
  : '(server)'

export const USER_DEVICE = Device.GetPlatformType()

export const ARCADE_TABLE_TYPES: {
  [name in ArcadeTableType]: ArcadeTableType
} = {
  Pinball: 'Pinball',
  AirHockey: 'AirHockey',
  Foosball: 'Foosball',
}

export const ARCADE_TABLE_NAMES: ArcadeTableName[] = [
  'Table1',
  'Table2',
  'Table3',
  'Table4',
]

export const ARCADE_TABLE_NEXT_NAMES: ArcadeTableNextName[] = [
  'Table1Next',
  'Table2Next',
  'Table3Next',
  'Table4Next',
]

export const EXTENDED_ARCADE_TABLE_NAMES: Array<
  ArcadeTableName | ArcadeTableNextName
> = [...ARCADE_TABLE_NAMES, ...ARCADE_TABLE_NEXT_NAMES]

export const CURRENCY_TYPES: {
  [name in Currency]: Currency
} = {
  Dollars: 'Dollars',
  Levity: 'Levity',
  Tickets: 'Tickets',
}

export const CURRENCY_EMOJIS: {
  [name in Currency]: string
} = {
  Dollars: '💵',
  Levity: '✨',
  Tickets: '🎟️',
}

export const DIFFICULTY_TYPES: {
  [name in Difficulty]: Difficulty
} = {
  peaceful: 'peaceful',
  normal: 'normal',
}

export const TRUSS_NAMES: CabinetTrussName[] = [
  'Truss1',
  'Truss2',
  'Truss3',
  'Truss4',
]

export const TYCOON_TYPES: {
  [name in TycoonType]: TycoonType
} = {
  Elf: 'Elf',
  Human: 'Human',
  Omniverse: 'Omniverse',
}
