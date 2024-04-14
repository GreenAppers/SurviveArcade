import Object from '@rbxts/object-utils'
import { CollectionService } from '@rbxts/services'
import {
  ARCADE_TABLE_NAMES,
  TRUSS_NAMES,
} from 'ReplicatedStorage/shared/constants/core'
import { ArcadeTableTag } from 'ReplicatedStorage/shared/constants/tags'
import {
  ArcadeTablesState,
  ArcadeTableStatus,
  nextArcadeTableName,
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
  const compareDistance = (name: ArcadeTableName | ArcadeTableNextName) => {
    const arcadeSeatPosition = (
      game.Workspace.ArcadeTables?.FindFirstChild(name) as ArcadeTable
    )?.Seat?.Position
    if (!arcadeSeatPosition) return
    const distance = position.sub(arcadeSeatPosition).Magnitude
    if (distance < nearestDistance) {
      nearestArcadeTableName = name
      nearestDistance = distance
    }
  }
  for (const [name, arcadeTableState] of Object.entries(arcadeTablesState)) {
    if (teamName && arcadeTableState.teamName !== teamName) continue
    if (arcadeTableState.status === ArcadeTableStatus.Won) {
      compareDistance(nextArcadeTableName(name))
    } else {
      compareDistance(name)
    }
  }
  return nearestArcadeTableName
}

export function nearestCabinet(
  position: Vector3,
  arcadeTablesState?: ArcadeTablesState,
  teamName?: string,
) {
  let nearestDistance = math.huge
  let nearestArcadeTableName: ArcadeTableName | undefined
  for (const name of ARCADE_TABLE_NAMES) {
    if (teamName && arcadeTablesState?.[name]?.teamName !== teamName) continue
    const cabinet = game.Workspace.Map[name]
    if (!cabinet) continue
    const distance = position.sub(cabinet.Baseplate.Position).Magnitude
    if (distance < nearestDistance) {
      nearestArcadeTableName = name
      nearestDistance = distance
    }
  }
  return nearestArcadeTableName
}

export function nearestCabinetTruss(
  position: Vector3,
  arcadeTableName: ArcadeTableName,
): CabinetTrussName {
  const cabinet = game.Workspace.Map[arcadeTableName]
  if (!cabinet) return 'Truss2'
  let nearestDistance = math.huge
  let nearestCabinetTrussName: CabinetTrussName | undefined
  for (const name of TRUSS_NAMES) {
    const trussAttachment = cabinet[name].Attachment
    const distance = position.sub(trussAttachment.WorldPosition).Magnitude
    if (distance < nearestDistance) {
      nearestCabinetTrussName = name
      nearestDistance = distance
    }
  }
  return nearestCabinetTrussName || 'Truss2'
}
