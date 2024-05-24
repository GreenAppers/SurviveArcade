import { BEHAVIOR_TREE_STATUS } from 'ReplicatedStorage/shared/constants/core'

export function run(obj: BehaviorObject, ..._args: unknown[]) {
  return BEHAVIOR_TREE_STATUS.SUCCESS
}
