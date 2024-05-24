import { BEHAVIOR_TREE_STATUS } from 'ReplicatedStorage/shared/constants/core'
import { BehaviorObject } from 'ReplicatedStorage/shared/utils/behavior'

export function run(obj: BehaviorObject, ..._args: unknown[]) {
  const { sourceHumanoid, targetHumanoid } = obj.Blackboard
  if (
    sourceHumanoid &&
    sourceHumanoid.Health !== 0 &&
    targetHumanoid &&
    targetHumanoid.Jump
  ) {
    sourceHumanoid.Jump = true
  }
  return BEHAVIOR_TREE_STATUS.SUCCESS
}
