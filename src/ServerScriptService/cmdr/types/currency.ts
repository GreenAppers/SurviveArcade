import { Registry } from '@rbxts/cmdr'
import Object from '@rbxts/object-utils'
import { CURRENCY_TYPES } from 'ReplicatedStorage/shared/constants/core'

export = function (registry: Registry) {
  registry.RegisterType(
    'currency',
    registry.Cmdr.Util.MakeEnumType('currency', Object.keys(CURRENCY_TYPES)),
  )
}
