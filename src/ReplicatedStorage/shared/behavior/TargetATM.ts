import { BEHAVIOR_TREE_STATUS } from 'ReplicatedStorage/shared/constants/core'
import {
  addBehaviorPlan,
  BehaviorObject,
  BehaviorPlan,
  BehaviorPlanType,
} from 'ReplicatedStorage/shared/utils/behavior'
import { formatMessage, MESSAGE } from 'ReplicatedStorage/shared/utils/messages'

export function run(obj: BehaviorObject, ..._args: unknown[]) {
  const plan: BehaviorPlan = {
    status: formatMessage(MESSAGE.GuideCollectCoins),
    targetAttachment: game.Workspace.Map.ChangeMachine.Wedge.Attachment,
    type: BehaviorPlanType.Arcade,
  }

  addBehaviorPlan(obj, plan)

  return BEHAVIOR_TREE_STATUS.SUCCESS
}
