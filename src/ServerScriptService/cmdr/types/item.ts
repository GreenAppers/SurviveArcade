import { Registry } from '@rbxts/cmdr'
import Object from '@rbxts/object-utils'
import {
  CURRENCY_TYPES,
  TOOL_NAMES,
} from 'ReplicatedStorage/shared/constants/core'

export = function (registry: Registry) {
  registry.RegisterType(
    'item',
    registry.Cmdr.Util.MakeEnumType('item', [
      ...Object.keys(CURRENCY_TYPES),
      ...Object.keys(TOOL_NAMES),
    ]),
  )
}
