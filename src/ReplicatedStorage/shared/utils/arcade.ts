import Object from '@rbxts/object-utils'
import { CollectionService } from '@rbxts/services'
import { ARCADE_TABLE_TYPES } from 'ReplicatedStorage/shared/constants/core'
import {
  ArcadeCabinetTag,
  ArcadeTableTag,
} from 'ReplicatedStorage/shared/constants/tags'

export function firstArcadeTableMap(
  arcadeTableType: ArcadeTableType,
): ArcadeTableMap {
  switch (arcadeTableType) {
    case 'AirHockey':
      return 'AirHockey1'
    case 'Foosball':
      return 'Foosball1'
    case 'Pinball':
      return 'Pinball1'
  }
}

export function nextArcadeTableType(
  arcadeTableType: ArcadeTableType,
): ArcadeTableType {
  const types = Object.values(ARCADE_TABLE_TYPES)
  const index = types.indexOf(arcadeTableType)
  return types[(index + 1) % types.size()]
}

export function isArcadeTable(arcadeTable: Instance) {
  return CollectionService.HasTag(arcadeTable, ArcadeTableTag)
}

export function getArcadeCabinetFromDescendent(instance: Instance) {
  while (instance) {
    if (CollectionService.HasTag(instance, ArcadeCabinetTag))
      return instance as Instance & { Name: ArcadeTableName }
    if (!instance.Parent) break
    instance = instance.Parent
  }
  return undefined
}

export function getArcadeTableFromDescendent(instance: Instance) {
  while (instance) {
    if (CollectionService.HasTag(instance, ArcadeTableTag))
      return instance as ArcadeTable
    if (!instance.Parent) break
    instance = instance.Parent
  }
  return undefined
}