import { BEHAVIOR_TREE_STATUS } from 'ReplicatedStorage/shared/constants/core'
import {
  BehaviorObject,
  PathStatus,
  getBehaviorTime,
  stopPathFinding,
} from 'ReplicatedStorage/shared/utils/behavior'

export const NPC_STUCK_SECONDS = 5

export function run(obj: BehaviorObject, ..._args: unknown[]) {
  const {
    path,
    sourceHumanoid,
    sourceHumanoidRootPart,
    targetAttachment,
    targetHumanoid,
    targetPart,
    targetSeat,
  } = obj.Blackboard
  const targetPosition =
    targetAttachment?.WorldPosition ||
    targetPart?.Position ||
    targetHumanoid?.RootPart?.Position
  if (
    !sourceHumanoidRootPart ||
    !sourceHumanoid ||
    sourceHumanoid.Health === 0 ||
    !targetPosition
  ) {
    return BEHAVIOR_TREE_STATUS.FAIL
  }

  // Sit down if needed
  const position = sourceHumanoidRootPart.Position
  const distance = targetPosition.sub(position).Magnitude
  if (targetSeat && !sourceHumanoid.Sit && distance < 3) {
    stopPathFinding(obj)
    targetSeat.Sit(sourceHumanoid)
    return BEHAVIOR_TREE_STATUS.SUCCESS
  }

  const now = getBehaviorTime(obj)
  if (
    !sourceHumanoid?.Sit &&
    (!obj.previousPositionTime ||
      now - obj.previousPositionTime > NPC_STUCK_SECONDS)
  ) {
    if (
      obj.previousPosition &&
      obj.previousPositionTime &&
      now - obj.previousPositionTime < NPC_STUCK_SECONDS + 1 &&
      obj.previousPosition.sub(position).Magnitude < 1
    ) {
      // Toggle path finding if stuck for NPC_STUCK_SECONDS
      stopPathFinding(obj)
      obj.pathEnabled = !obj.pathEnabled
    }
    obj.previousPosition = position
    obj.previousPositionTime = now
  }

  // Optionally target a humanoid
  if (targetHumanoid && targetHumanoid.Health !== 0 && distance > 5) {
    wait(2)
    sourceHumanoid.WalkSpeed = 30
  } else if (targetHumanoid && targetHumanoid.Health !== 0 && distance < 5) {
    sourceHumanoid.WalkSpeed = 16
  }

  // Move to target
  const target = targetPosition.add(targetPosition.sub(position).Unit.mul(2))
  if (path && obj.pathEnabled) {
    if (obj.pathStatus === PathStatus.Running) {
      return BEHAVIOR_TREE_STATUS.RUNNING
    } else {
      const result = path.Run(target)
      if (result) {
        obj.pathStatus = PathStatus.Running
        return BEHAVIOR_TREE_STATUS.RUNNING
      } else {
        return obj.pathStatus === PathStatus.Reached
          ? BEHAVIOR_TREE_STATUS.SUCCESS
          : BEHAVIOR_TREE_STATUS.FAIL
      }
    }
  } else {
    sourceHumanoid.MoveTo(
      target,
      game.Workspace.FindFirstChild<Terrain>('Terrain'),
    )
  }

  return BEHAVIOR_TREE_STATUS.SUCCESS
}
