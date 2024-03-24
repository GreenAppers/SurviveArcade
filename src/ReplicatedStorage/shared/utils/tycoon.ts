import { CollectionService } from '@rbxts/services'
import {
  TycoonPlotTag,
  TycoonTag,
} from 'ReplicatedStorage/shared/constants/tags'

export function isTycoon(tycoon: Instance) {
  return CollectionService.HasTag(tycoon, TycoonTag)
}

export function isTycoonPlot(tycoon: Instance) {
  return CollectionService.HasTag(tycoon, TycoonPlotTag)
}

export function getTycoonFromDescendent(instance: Instance) {
  while (instance) {
    if (CollectionService.HasTag(instance, TycoonTag)) return instance as Tycoon
    if (!instance.Parent) break
    instance = instance.Parent
  }
  return undefined
}

export function getTycoonPlotFromDescendent(instance: Instance) {
  while (instance) {
    if (CollectionService.HasTag(instance, TycoonPlotTag))
      return instance as TycoonPlot
    if (!instance.Parent) break
    instance = instance.Parent
  }
  return undefined
}

export function getTycoonPlotNameFromDescendent(instance: Instance) {
  const tycoonPlot = getTycoonPlotFromDescendent(instance)
  return tycoonPlot?.Name
}
