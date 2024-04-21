import { CollectionService } from '@rbxts/services'
import { TYCOON_NAMES } from 'ReplicatedStorage/shared/constants/core'
import {
  TycoonPlotTag,
  TycoonTag,
} from 'ReplicatedStorage/shared/constants/tags'
import { PlayerTycoonButtons } from 'ReplicatedStorage/shared/state/PlayersState'
import { TycoonsState } from 'ReplicatedStorage/shared/state/TycoonState'
import { getCurrency } from 'ReplicatedStorage/shared/utils/currency'

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

export function isTycoonButtonDependencyMet(
  button: TycoonButtonModel,
  playerTycoonButtons?: PlayerTycoonButtons,
) {
  const dependencies = button.Button.GetAttribute('Dependency')
  if (dependencies && typeIs(dependencies, 'string')) {
    if (!playerTycoonButtons) return false
    for (const dependency of dependencies.split(',')) {
      if (!playerTycoonButtons[dependency]) return false
    }
  }
  return true
}

export function getTycoonButtonCurrency(button: TycoonButtonModel) {
  const currencyName = button.Button.GetAttribute('Currency')
  return currencyName && typeIs(currencyName, 'string')
    ? getCurrency(currencyName)
    : undefined
}

export function getTycoonButtonCost(button: TycoonButtonModel) {
  const cost = button.Button.GetAttribute('Cost')
  return cost && typeIs(cost, 'number') ? cost : undefined
}
