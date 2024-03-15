import { Players, RunService } from '@rbxts/services'
import { $NODE_ENV } from 'rbxts-transform-env'

export const IS_PROD = $NODE_ENV === 'production'
export const IS_CANARY = $NODE_ENV === 'canary'
export const IS_EDIT = RunService.IsStudio() && !RunService.IsRunning()

export const USER_ID = Players.LocalPlayer ? Players.LocalPlayer.UserId : 0
export const USER_NAME = Players.LocalPlayer
  ? Players.LocalPlayer.Name
  : '(server)'

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
}
