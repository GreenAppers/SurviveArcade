import { CollectionService } from '@rbxts/services'
import {
  TycoonPlotTag,
  TycoonTag,
} from 'ReplicatedStorage/shared/constants/tags'
import ElfButtons from 'ReplicatedStorage/shared/constants/tycoon/Elf/buttons.json'
import {
  getPlayerCurrency,
  PlayerState,
  PlayerTycoonButtons,
} from 'ReplicatedStorage/shared/state/PlayersState'

export const tycoonConstants: {
  [name in TycoonType]: { Buttons: Record<string, TycoonButtonDetails> }
} = {
  Elf: {
    Buttons: ElfButtons,
  },
  Human: {
    Buttons: {},
  },
  Omniverse: {
    Buttons: {},
  },
}

export function isTycoon(tycoon: Instance) {
  return CollectionService.HasTag(tycoon, TycoonTag)
}

export function isTycoonPlot(tycoon: Instance) {
  return CollectionService.HasTag(tycoon, TycoonPlotTag)
}

export function getTycoonType(
  tycoonType?: AttributeValue,
): TycoonType | undefined {
  if (!typeIs(tycoonType, 'string')) return undefined
  switch (tycoonType) {
    case 'Elf':
    case 'Human':
    case 'Omniverse':
      return tycoonType
    default:
      return undefined
  }
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

export function isTycoonButtonDependencyMet(
  details?: TycoonButtonDetails,
  playerTycoonButtons?: PlayerTycoonButtons,
) {
  if (!details || !playerTycoonButtons) return false
  if (!details.Dependencies.size()) return true
  for (const dependency of details.Dependencies.split(',')) {
    if (!playerTycoonButtons[dependency]) return false
  }
  return true
}

export function getTycoonButtonColor(
  playerState?: PlayerState,
  currency?: Currency,
  cost?: number,
) {
  if (
    !cost ||
    (playerState &&
      currency &&
      getPlayerCurrency(playerState, currency) >= cost)
  ) {
    return new BrickColor('Lime green')
  } else {
    return new BrickColor('Bright red')
  }
}
