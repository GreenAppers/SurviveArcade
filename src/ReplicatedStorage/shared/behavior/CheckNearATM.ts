import { BEHAVIOR_TREE_STATUS } from 'ReplicatedStorage/shared/constants/core'
import { BehaviorObject } from 'ReplicatedStorage/shared/utils/behavior'

export function run(obj: BehaviorObject, ..._args: unknown[]) {
  const { sourceAttachment } = obj.Blackboard
  const targetAttachment = game.Workspace.Map.ChangeMachine.Wedge.Attachment
  if (!sourceAttachment || !targetAttachment) return BEHAVIOR_TREE_STATUS.FAIL

  const dist = sourceAttachment.Position.sub(
    targetAttachment.Position,
  ).Magnitude
  return dist <= 10 ? BEHAVIOR_TREE_STATUS.SUCCESS : BEHAVIOR_TREE_STATUS.FAIL
}
