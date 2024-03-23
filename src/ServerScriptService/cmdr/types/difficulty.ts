import { Registry } from '@rbxts/cmdr'
import Object from '@rbxts/object-utils'
import { DIFFICULTY_TYPES } from 'ReplicatedStorage/shared/constants/core'

export = function (registry: Registry) {
  registry.RegisterType(
    'difficulty',
    registry.Cmdr.Util.MakeEnumType(
      'difficulty',
      Object.keys(DIFFICULTY_TYPES),
    ),
  )
}
