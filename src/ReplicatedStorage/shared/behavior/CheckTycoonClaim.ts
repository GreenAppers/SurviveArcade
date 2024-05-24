import { BEHAVIOR_TREE_STATUS } from 'ReplicatedStorage/shared/constants/core'
import { selectTycoonsState } from 'ReplicatedStorage/shared/state'
import { findTycoonNameOwnedBy } from 'ReplicatedStorage/shared/state/TycoonState'
import { BehaviorObject } from 'ReplicatedStorage/shared/utils/behavior'

export function run(obj: BehaviorObject, ..._args: unknown[]) {
  const { state, sourceUserId } = obj.Blackboard
  if (!state || !sourceUserId) return BEHAVIOR_TREE_STATUS.FAIL

  const tycoonsState = selectTycoonsState()(state)
  const tycoonName = findTycoonNameOwnedBy(tycoonsState, sourceUserId)

  return tycoonName ? BEHAVIOR_TREE_STATUS.SUCCESS : BEHAVIOR_TREE_STATUS.FAIL
}
