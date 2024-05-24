import { BEHAVIOR_TREE_STATUS } from 'ReplicatedStorage/shared/constants/core'
import { BehaviorObject } from 'ReplicatedStorage/shared/utils/behavior'

export function run(_obj: BehaviorObject, ..._args: unknown[]) {
  return BEHAVIOR_TREE_STATUS.SUCCESS
}
