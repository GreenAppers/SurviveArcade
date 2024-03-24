import { CollectionService, Players } from '@rbxts/services'
import { getArcadeTableFromDescendent } from 'ReplicatedStorage/shared/utils/arcade'
import { getTycoonFromDescendent } from 'ReplicatedStorage/shared/utils/tycoon'
import { store } from 'ServerScriptService/store'

type PlayerReceivingFunction = (player: Player) => unknown

export function getDescendentsWhichAre(
  ancestor: Instance,
  className: keyof Instances,
) {
  assert(typeOf(ancestor) === 'Instance', 'Expected Instance ancestor')
  assert(typeOf(className) === 'string', 'Expected string className')
  const descendents = []
  for (const descendent of ancestor.GetDescendants()) {
    if (descendent.IsA(className)) descendents.push(descendent)
  }
  return descendents
}

export function getDescendentsWithTag(ancestor: Instance, tagName: string) {
  assert(typeOf(ancestor) === 'Instance', 'Expected Instance ancestor')
  const descendents = []
  for (const descendent of ancestor.GetDescendants()) {
    if (CollectionService.HasTag(descendent, tagName))
      descendents.push(descendent)
  }
  return descendents
}

export function setNetworkOwner(ancestor: Instance, player?: Player) {
  for (const descendent of ancestor.GetDescendants()) {
    if (descendent.IsA('BasePart') && descendent.CanSetNetworkOwnership()[0]) {
      descendent.SetNetworkOwner(player)
    }
  }
  if (ancestor.IsA('BasePart') && ancestor.CanSetNetworkOwnership()[0]) {
    ancestor.SetNetworkOwner(player)
  }
}

export function forEveryPlayer(
  joinFunc: PlayerReceivingFunction,
  leaveFunc?: PlayerReceivingFunction,
): Array<RBXScriptConnection> {
  const events: Array<RBXScriptConnection> = []

  Players.GetPlayers().forEach(joinFunc)
  events.push(Players.PlayerAdded.Connect(joinFunc))
  if (leaveFunc) events.push(Players.PlayerRemoving.Connect(leaveFunc))

  return events
}

export function getArcadeTableStateFromDescendent(instance: Instance) {
  const arcadeTable = getArcadeTableFromDescendent(instance)
  if (!arcadeTable?.Name) return undefined
  return store.getState().arcadeTables[arcadeTable.Name]
}

export function getArcadeTableOwner(instance: Instance) {
  return getArcadeTableStateFromDescendent(instance)?.owner
}

export function getTycoonStateFromDescendent(instance: Instance) {
  const tycoon = getTycoonFromDescendent(instance)
  if (!tycoon?.Name) return undefined
  return store.getState().tycoons[tycoon.Name]
}

export function getTycoonOwner(instance: Instance) {
  return getTycoonStateFromDescendent(instance)?.owner
}
