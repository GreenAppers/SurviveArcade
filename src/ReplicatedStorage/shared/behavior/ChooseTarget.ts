import { BEHAVIOR_TREE_STATUS } from 'ReplicatedStorage/shared/constants/core'
import { selectPlayerState } from 'ReplicatedStorage/shared/state'
import {
  BehaviorObject,
  BehaviorPlanType,
} from 'ReplicatedStorage/shared/utils/behavior'

export function run(obj: BehaviorObject, ..._args: unknown[]) {
  const { plan, sourceHumanoidRootPart, sourceUserId, state } = obj.Blackboard
  if (!plan || !sourceHumanoidRootPart || !sourceUserId || !state)
    return BEHAVIOR_TREE_STATUS.FAIL

  const arcadeTargetAttachment = plan[BehaviorPlanType.Arcade]?.targetAttachment
  const tycoonTargetAttachment = plan[BehaviorPlanType.Tycoon]?.targetAttachment
  const playerState = selectPlayerState(sourceUserId)(state)
  if (!playerState) return BEHAVIOR_TREE_STATUS.FAIL

  let status
  let targetAttachment
  if (
    !playerState.groundArcadeTableName &&
    (playerState.tablePlays > 0 ||
      !arcadeTargetAttachment ||
      (tycoonTargetAttachment &&
        sourceHumanoidRootPart.Position.sub(
          tycoonTargetAttachment.WorldPosition,
        ).Magnitude <
          sourceHumanoidRootPart.Position.sub(
            arcadeTargetAttachment.WorldPosition,
          ).Magnitude))
  ) {
    status = plan[BehaviorPlanType.Tycoon]?.status
    targetAttachment = tycoonTargetAttachment
  }
  if (!status) {
    status = plan[BehaviorPlanType.Arcade]?.status
    targetAttachment = arcadeTargetAttachment
  }

  if (status) {
    obj.Blackboard.status = status
    obj.Blackboard.targetAttachment = targetAttachment
  }

  return BEHAVIOR_TREE_STATUS.SUCCESS
}
