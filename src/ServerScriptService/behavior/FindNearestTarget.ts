import {
  BEHAVIOR_TREE_STATUS,
  CHARACTER_CHILD,
} from 'ReplicatedStorage/shared/constants/core'
import { BehaviorObject } from 'ReplicatedStorage/shared/utils/behavior'

export function run(obj: BehaviorObject, ..._args: unknown[]) {
  const blackboard = obj.Blackboard
  const { sourceHumanoid, sourceHumanoidRootPart, sourceInstance } = blackboard
  let minDistance = math.huge
  let minDistanceTargetPart
  let minDistanceHumanoid
  let minDistanceHumanoidRootPart
  for (const targetModel of game.Workspace.GetChildren()) {
    if (
      sourceHumanoidRootPart &&
      sourceHumanoid &&
      sourceHumanoid.Health !== 0 &&
      targetModel.IsA('Model') &&
      targetModel !== sourceInstance &&
      targetModel.Name !== sourceInstance?.Name &&
      targetModel.FindFirstChild('HumanoidRootPart') &&
      targetModel.FindFirstChild('Head')
    ) {
      const targetHumanoid = targetModel.FindFirstChildOfClass('Humanoid')
      const targetHumanoidRootPart = targetModel.FindFirstChild<BasePart>(
        CHARACTER_CHILD.HumanoidRootPart,
      )
      if (
        targetHumanoid &&
        targetHumanoid.Health !== 0 &&
        targetHumanoidRootPart &&
        targetHumanoidRootPart.Position.sub(sourceHumanoidRootPart.Position)
          .Magnitude < minDistance
      ) {
        minDistanceHumanoid = targetHumanoid
        minDistanceHumanoidRootPart = targetHumanoidRootPart
        minDistanceTargetPart = targetHumanoidRootPart
        minDistance = targetHumanoidRootPart.Position.sub(
          sourceHumanoidRootPart.Position,
        ).Magnitude
      }
    }
  }
  if (
    minDistanceTargetPart &&
    minDistanceHumanoid &&
    minDistanceHumanoidRootPart
  ) {
    blackboard.targetPart = minDistanceTargetPart
    blackboard.targetHumanoid = minDistanceHumanoid
    blackboard.targetHumanoidRootPart = minDistanceHumanoidRootPart
    return BEHAVIOR_TREE_STATUS.SUCCESS
  } else {
    return BEHAVIOR_TREE_STATUS.FAIL
  }
}
