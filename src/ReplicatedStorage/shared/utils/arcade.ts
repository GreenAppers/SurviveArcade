import { CollectionService } from '@rbxts/services'
import { ArcadeTableTag } from 'ReplicatedStorage/shared/constants/tags'

export function isArcadeTable(arcadeTable: Instance) {
  return CollectionService.HasTag(arcadeTable, ArcadeTableTag)
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
