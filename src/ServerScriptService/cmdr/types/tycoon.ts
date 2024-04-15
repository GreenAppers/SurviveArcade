import { Registry } from '@rbxts/cmdr'
import { TYCOON_NAMES } from 'ReplicatedStorage/shared/constants/core'

export = function (registry: Registry) {
  registry.RegisterType(
    'tycoon',
    registry.Cmdr.Util.MakeEnumType('tycoon', ['None', ...TYCOON_NAMES]),
  )
}
