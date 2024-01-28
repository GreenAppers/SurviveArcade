import { Players, RunService } from '@rbxts/services'
import { $NODE_ENV } from 'rbxts-transform-env'

export const IS_PROD = $NODE_ENV === 'production'
export const IS_CANARY = $NODE_ENV === 'canary'
export const IS_EDIT = RunService.IsStudio() && !RunService.IsRunning()

export const USER_ID = Players.LocalPlayer ? Players.LocalPlayer.UserId : 0
export const USER_NAME = Players.LocalPlayer
  ? Players.LocalPlayer.Name
  : '(server)'

export const ARCADE_TABLE_NAMES: ArcadeTableName[] = [
  'Table1',
  'Table2',
  'Table3',
  'Table4',
]

export const EXTENDED_ARCADE_TABLE_NAMES: Array<
  ArcadeTableName | ArcadeTableNextName
> = [
  'Table1',
  'Table1Next',
  'Table2',
  'Table2Next',
  'Table3',
  'Table3Next',
  'Table4',
  'Table4Next',
]

export const TRUSS_NAMES: CabinetTrussName[] = [
  'Truss1',
  'Truss2',
  'Truss3',
  'Truss4',
]
