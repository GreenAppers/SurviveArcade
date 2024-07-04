import { BEHAVIOR_TREE_STATUS } from 'ReplicatedStorage/shared/constants/core'
import { selectArcadeTableState } from 'ReplicatedStorage/shared/state'
import { ArcadeTableStatus } from 'ReplicatedStorage/shared/state/ArcadeTablesState'
import { mechanics } from 'ReplicatedStorage/shared/tables/mechanics'
import {
  BehaviorObject,
  waitAfterBehaviorCompleted,
} from 'ReplicatedStorage/shared/utils/behavior'

export function run(obj: BehaviorObject, ..._args: unknown[]) {
  const { sourceArcadeTableName, sourceHumanoid, sourceUserId, state } =
    obj.Blackboard
  if (!sourceArcadeTableName || !sourceHumanoid || !sourceUserId || !state)
    return BEHAVIOR_TREE_STATUS.FAIL

  const arcadeTable = game.Workspace.ArcadeTables[sourceArcadeTableName]
  const arcadeTableState = selectArcadeTableState(sourceArcadeTableName)(state)
  if (!arcadeTable || !arcadeTableState) return BEHAVIOR_TREE_STATUS.FAIL

  // If we just won, wait for the winning sequence to finish, then jump.
  if (arcadeTableState.status === ArcadeTableStatus.Won) {
    if (!waitAfterBehaviorCompleted(obj, 3)) return BEHAVIOR_TREE_STATUS.SUCCESS
    sourceHumanoid.Jump = true
    return BEHAVIOR_TREE_STATUS.SUCCESS
  }

  if (arcadeTableState.owner !== sourceUserId) return BEHAVIOR_TREE_STATUS.FAIL

  mechanics[arcadeTableState.tableType].onNPCPlayingBehavior(
    arcadeTable.Name,
    sourceUserId,
    obj,
  )

  return BEHAVIOR_TREE_STATUS.RUNNING
}
