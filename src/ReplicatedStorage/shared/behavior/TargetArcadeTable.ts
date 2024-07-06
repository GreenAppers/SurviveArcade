import Object from '@rbxts/object-utils'
import {
  ARCADE_TABLE_NAMES,
  BEHAVIOR_TREE_STATUS,
  GUIDE_TRUSS_NAMES,
  JOB_ID,
  USER_ID,
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
import { findDescendentWithPath } from 'ReplicatedStorage/shared/utils/instance'
import { formatMessage, MESSAGE } from 'ReplicatedStorage/shared/utils/messages'
import { shuffle } from 'ReplicatedStorage/shared/utils/object'

export function nearestArcadeTable(
  position: Vector3,
  arcadeTablesState: ArcadeTablesState,
  teamName?: string,
) {
  let nearestDistance = math.huge
  let nearestArcadeTableName: ArcadeTableName | ArcadeTableNextName | undefined
  const compareDistance = (name: ArcadeTableName | ArcadeTableNextName) => {
    const arcadeSeatPosition = findDescendentWithPath<Seat>(
      game.Workspace.ArcadeTables,
      [name, 'Control', 'Seat'],
    )?.Position
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

export function randomCabinet(
  arcadeTablesState?: ArcadeTablesState,
  spawnNumber?: number,
  teamName?: string,
) {
  const randomTables = shuffle(
    ARCADE_TABLE_NAMES,
    new Random(JOB_ID + USER_ID + (spawnNumber || 0)),
  )
  for (const name of randomTables) {
    const state = arcadeTablesState?.[name]
    if (state?.owner) continue
    if (teamName && state?.teamName !== teamName) continue
    return name
  }
  return randomTables[0]
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
    const distance = position.sub(cabinet.Ground.Position).Magnitude
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
  for (const name of GUIDE_TRUSS_NAMES) {
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
  localPlayerSpawnNumber?: number,
  localPlayerTeamName?: string,
): [Attachment | undefined, Seat | undefined, string] {
  let targetAttachment
  let targetSeat
  let targetStatus = formatMessage(MESSAGE.GuideWinTickets)

  if (rootRigAttachment.WorldPosition.Y < 20) {
    // Choose a Cabinet
    const arcadeTableName =
      new Vector3(
        rootRigAttachment.WorldPosition.X,
        0,
        rootRigAttachment.WorldPosition.Z,
      ).Magnitude < 150
        ? randomCabinet(
            arcadeTablesState,
            localPlayerSpawnNumber,
            localPlayerTeamName,
          )
        : nearestCabinet(
            rootRigAttachment.WorldPosition,
            arcadeTablesState,
            localPlayerTeamName,
          )
    if (!arcadeTableName) return [undefined, undefined, '']

    // Find nearest truss
    const trussName = nearestCabinetTruss(
      rootRigAttachment.WorldPosition,
      arcadeTableName,
    )
    targetAttachment =
      game.Workspace.Map[arcadeTableName]?.[trussName]?.Attachment

    if (
      targetAttachment &&
      rootRigAttachment.WorldPosition.sub(targetAttachment.WorldPosition)
        .Magnitude < 20
    ) {
      targetAttachment =
        game.Workspace.Map[arcadeTableName]?.[trussName]?.TopAttachment
      targetStatus = MESSAGE.Climb
    }
  }

  if (!targetAttachment) {
    // Find nearest Arcade Table
    const arcadeTableName = nearestArcadeTable(
      rootRigAttachment.WorldPosition,
      arcadeTablesState,
      localPlayerTeamName,
    )
    if (!arcadeTableName) return [undefined, undefined, '']
    targetSeat = game.Workspace.ArcadeTables[arcadeTableName]?.Control?.Seat
    targetAttachment = targetSeat?.Attachment
  }

  return [targetAttachment, targetSeat, targetStatus]
}

export function run(obj: BehaviorObject, ..._args: unknown[]) {
  const { sourceAttachment, sourceUserId, state } = obj.Blackboard
  if (!sourceAttachment || !sourceUserId || !state)
    return BEHAVIOR_TREE_STATUS.FAIL

  const [targetAttachment, targetSeat, targetStatus] = findArcadeTableTarget(
    selectArcadeTablesState()(state),
    sourceAttachment,
    obj.Blackboard.sourceSpawnNumber,
    obj.Blackboard.sourceTeamName,
  )
  if (!targetAttachment) return BEHAVIOR_TREE_STATUS.FAIL

  const plan: BehaviorPlan = {
    status: targetStatus,
    targetAttachment,
    targetSeat,
    type: BehaviorPlanType.Arcade,
  }
  addBehaviorPlan(obj, plan)

  return BEHAVIOR_TREE_STATUS.SUCCESS
}
