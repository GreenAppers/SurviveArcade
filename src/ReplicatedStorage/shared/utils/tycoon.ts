import { CollectionService } from '@rbxts/services'
import { TYCOON_NAMES } from 'ReplicatedStorage/shared/constants/core'
import {
  TycoonPlotTag,
  TycoonTag,
} from 'ReplicatedStorage/shared/constants/tags'
import { TycoonsState } from 'ReplicatedStorage/shared/state/TycoonState'

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

export function nearestTycoonPlot(
  position: Vector3,
  tycoonsState?: TycoonsState,
) {
  let nearestDistance = math.huge
  let nearestTycoonName: TycoonName | undefined
  for (const name of TYCOON_NAMES) {
    if (tycoonsState?.[name]?.owner) continue
    const tycoon = game.Workspace.Map[name]
    if (!tycoon) continue
    const distance = position.sub(tycoon.Baseplate.Position).Magnitude
    if (distance < nearestDistance) {
      nearestTycoonName = name
      nearestDistance = distance
    }
  }
  return nearestTycoonName
}
