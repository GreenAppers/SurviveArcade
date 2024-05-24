import { BEHAVIOR_TREE_STATUS } from 'ReplicatedStorage/shared/constants/core'
import { selectPlayerState } from 'ReplicatedStorage/shared/state'
import { BehaviorObject } from 'ReplicatedStorage/shared/utils/behavior'

export function run(obj: BehaviorObject, ..._args: unknown[]) {
  const { state, sourceUserId } = obj.Blackboard
  if (!state || !sourceUserId) return BEHAVIOR_TREE_STATUS.FAIL

  const playerState = selectPlayerState(sourceUserId)(state)
  if (!playerState) return BEHAVIOR_TREE_STATUS.FAIL

  return (playerState?.dollars ?? 0) > 0
    ? BEHAVIOR_TREE_STATUS.SUCCESS
    : BEHAVIOR_TREE_STATUS.FAIL
}
