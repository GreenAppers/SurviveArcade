import { BEHAVIOR_TREE_STATUS } from 'ReplicatedStorage/shared/constants/core'
import { BehaviorObject } from 'ReplicatedStorage/shared/utils/behavior'

export function run(obj: BehaviorObject, ..._args: unknown[]) {
  const {
    path,
    sourceHumanoid,
    sourceHumanoidRootPart,
    targetAttachment,
    targetHumanoid,
    targetPart,
  } = obj.Blackboard
  obj.notice = true
  const targetPosition =
    targetAttachment?.WorldPosition ||
    targetPart?.Position ||
    targetHumanoid?.RootPart?.Position
  if (
    sourceHumanoidRootPart &&
    sourceHumanoid &&
    sourceHumanoid.Health !== 0 &&
    targetPosition
  ) {
    if (
      targetHumanoid &&
      targetHumanoid.Health !== 0 &&
      targetPosition.sub(sourceHumanoidRootPart.Position).Magnitude > 5
    ) {
      wait(2)
      sourceHumanoid.WalkSpeed = 30
    } else if (
      targetHumanoid &&
      targetHumanoid.Health !== 0 &&
      targetPosition.sub(sourceHumanoidRootPart.Position).Magnitude < 5
    ) {
      sourceHumanoid.WalkSpeed = 16
    }
    const target = targetPosition.add(
      targetPosition.sub(sourceHumanoidRootPart.Position).Unit.mul(2),
    )
    if (path) {
      path.Run(target)
    } else {
      sourceHumanoid.MoveTo(
        target,
        game.Workspace.FindFirstChild<Terrain>('Terrain'),
      )
    }
  }
  return BEHAVIOR_TREE_STATUS.SUCCESS
}
