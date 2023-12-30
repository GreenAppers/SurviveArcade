import Object from '@rbxts/object-utils'
import { CollectionService } from '@rbxts/services'
import { ArcadeTableTag } from 'ReplicatedStorage/shared/constants/tags'
import {
  ArcadeTablesState,
  ArcadeTableStatus,
} from 'ReplicatedStorage/shared/state/ArcadeTablesState'

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

export function nearestArcadeTable(
  position: Vector3,
  arcadeTablesState: ArcadeTablesState,
  teamName?: string,
) {
  let nearestDistance = math.huge
  let nearestArcadeTableName: ArcadeTableName | ArcadeTableNextName | undefined
  for (const [name, arcadeTableState] of Object.entries(arcadeTablesState)) {
    if (arcadeTableState.status === ArcadeTableStatus.Won) continue
    if (teamName && arcadeTableState.teamName !== teamName) continue
    const arcadeSeatPosition =
      game.Workspace.ArcadeTables?.[name]?.Seat?.Position
    if (!arcadeSeatPosition) continue
    const distance = position.sub(arcadeSeatPosition).Magnitude
    if (distance < nearestDistance) {
      nearestArcadeTableName = name
      nearestDistance = distance
    }
  }
  return nearestArcadeTableName
}
