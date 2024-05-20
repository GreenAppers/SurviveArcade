import { BEHAVIOR_TREE_STATUS } from 'ReplicatedStorage/shared/constants/core'

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
