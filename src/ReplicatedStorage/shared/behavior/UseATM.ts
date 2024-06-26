import {
  BEHAVIOR_TREE_STATUS,
  CURRENCY_TYPES,
} from 'ReplicatedStorage/shared/constants/core'
import { BehaviorObject } from 'ReplicatedStorage/shared/utils/behavior'

export function run(obj: BehaviorObject, ..._args: unknown[]) {
  const { serverStore, sourceHumanoid, sourceUserId } = obj.Blackboard
  if (!serverStore || !sourceHumanoid || !sourceUserId)
    return BEHAVIOR_TREE_STATUS.FAIL

  serverStore.addPlayerCurrency(sourceUserId, CURRENCY_TYPES.Dollars, 1)

  return BEHAVIOR_TREE_STATUS.SUCCESS
}
