import { Players, RunService } from '@rbxts/services'
import { $NODE_ENV } from 'rbxts-transform-env'

export const IS_PROD = $NODE_ENV === 'production'
export const IS_CANARY = $NODE_ENV === 'canary'
export const IS_EDIT = RunService.IsStudio() && !RunService.IsRunning()

export const USER_ID = Players.LocalPlayer ? Players.LocalPlayer.UserId : 0
export const USER_NAME = Players.LocalPlayer
  ? Players.LocalPlayer.Name
  : '(server)'
