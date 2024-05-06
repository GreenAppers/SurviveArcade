import { Registry } from '@rbxts/cmdr'
import Object from '@rbxts/object-utils'
import { TOOL_NAMES } from 'ReplicatedStorage/shared/constants/core'

export = function (registry: Registry) {
  registry.RegisterType(
    'tool',
    registry.Cmdr.Util.MakeEnumType('tool', Object.keys(TOOL_NAMES)),
  )
}
