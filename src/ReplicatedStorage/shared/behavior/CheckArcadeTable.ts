import { BEHAVIOR_TREE_STATUS } from 'ReplicatedStorage/shared/constants/core'
import { selectArcadeTablesState } from 'ReplicatedStorage/shared/state'
import { findArcadeTableNameOwnedBy } from 'ReplicatedStorage/shared/state/ArcadeTablesState'
import { BehaviorObject } from 'ReplicatedStorage/shared/utils/behavior'

export function run(obj: BehaviorObject, ..._args: unknown[]) {
  const { state, sourceUserId } = obj.Blackboard
  if (!state || !sourceUserId) return BEHAVIOR_TREE_STATUS.FAIL

  const arcadeTablesState = selectArcadeTablesState()(state)
  const arcadeTableName = findArcadeTableNameOwnedBy(
    arcadeTablesState,
    sourceUserId,
  )

  obj.Blackboard.sourceArcadeTableName = arcadeTableName

  return arcadeTableName
    ? BEHAVIOR_TREE_STATUS.SUCCESS
    : BEHAVIOR_TREE_STATUS.FAIL
}
