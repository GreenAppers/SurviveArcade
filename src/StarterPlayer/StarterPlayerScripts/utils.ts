import { getArcadeTableFromDescendent } from 'ReplicatedStorage/shared/utils/arcade'
import { store } from 'StarterPlayer/StarterPlayerScripts/store'

/**
 * Reformat a number to a string with a thousands separator.
 */
export function formatInteger(value: unknown) {
  return tostring(value)
    .reverse()
    .gsub('%d%d%d', '%1,')[0]
    .reverse()
    .gsub('^,', '')[0]
}

export function formatDuration(value: number) {
  const minutes = math.floor(value / 60)
  const seconds = math.floor(value % 60)
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}

export function getArcadeTableStateFromDescendent(instance: Instance) {
  const arcadeTable = getArcadeTableFromDescendent(instance)
  if (!arcadeTable?.Name) return undefined
  return store.getState().arcadeTables[arcadeTable.Name]
}

export function getArcadeTableOwner(instance: Instance) {
  return getArcadeTableStateFromDescendent(instance)?.owner
}
