import Object from '@rbxts/object-utils'
import {
  ARCADE_TABLE_NAMES,
  BEHAVIOR_TREE_STATUS,
  TRUSS_NAMES,
} from 'ReplicatedStorage/shared/constants/core'
import { selectArcadeTablesState } from 'ReplicatedStorage/shared/state'
import {
  ArcadeTablesState,
  ArcadeTableStatus,
  nextArcadeTableName,
} from 'ReplicatedStorage/shared/state/ArcadeTablesState'
import {
  addBehaviorPlan,
  BehaviorObject,
  BehaviorPlan,
  BehaviorPlanType,
} from 'ReplicatedStorage/shared/utils/behavior'
import { formatMessage, MESSAGE } from 'ReplicatedStorage/shared/utils/messages'

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

export function findArcadeTableTarget(
  arcadeTablesState: ArcadeTablesState,
  rootRigAttachment: Attachment,
  localPlayerTeamName?: string,
): Attachment | undefined {
  let targetAttachment
  if (rootRigAttachment.WorldPosition.Y < 10) {
    // Find nearest Cabinet
    const arcadeTableName = nearestCabinet(
      rootRigAttachment.WorldPosition,
      arcadeTablesState,
      localPlayerTeamName,
    )
    if (!arcadeTableName) return undefined
    // Find nearest truss
    const trussName = nearestCabinetTruss(
      rootRigAttachment.WorldPosition,
      arcadeTableName,
    )
    targetAttachment =
      game.Workspace.Map[arcadeTableName]?.[trussName]?.Attachment
  } else {
    // Find nearest Arcade Table
    const arcadeTableName = nearestArcadeTable(
      rootRigAttachment.WorldPosition,
      arcadeTablesState,
      localPlayerTeamName,
    )
    if (!arcadeTableName) return undefined
    targetAttachment =
      game.Workspace.ArcadeTables[arcadeTableName]?.Seat?.Attachment
  }
  return targetAttachment
}

export function run(obj: BehaviorObject, ..._args: unknown[]) {
  const { sourceAttachment, sourceUserId, state } = obj.Blackboard
  if (!sourceAttachment || !sourceUserId || !state)
    return BEHAVIOR_TREE_STATUS.FAIL

  const targetAttachment = findArcadeTableTarget(
    selectArcadeTablesState()(state),
    sourceAttachment,
    obj.Blackboard.sourceTeamName,
  )
  if (!targetAttachment) return BEHAVIOR_TREE_STATUS.FAIL

  const plan: BehaviorPlan = {
    status: formatMessage(MESSAGE.GuideWinTickets),
    targetAttachment,
    type: BehaviorPlanType.Arcade,
  }
  addBehaviorPlan(obj, plan)

  return BEHAVIOR_TREE_STATUS.SUCCESS
}
