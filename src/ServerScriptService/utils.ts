import { CollectionService, Players } from '@rbxts/services'
import { ArcadeTableTag } from 'ReplicatedStorage/shared/constants/tags'
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

export function getArcadeTableOwner(instance: Instance) {
  const arcadeTable = getArcadeTableFromDescendent(instance)
  if (!arcadeTable?.Name) return undefined
  return store.getState().arcadeTables[arcadeTable.Name]?.owner
}
