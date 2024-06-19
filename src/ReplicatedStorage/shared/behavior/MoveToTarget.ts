import { BEHAVIOR_TREE_STATUS } from 'ReplicatedStorage/shared/constants/core'
import {
  BehaviorObject,
  getBehaviorTime,
  PathStatus,
  stopPathFinding,
} from 'ReplicatedStorage/shared/utils/behavior'
import { selectPlayerState } from '../state'

export const NPC_STUCK_SECONDS = 5

export function run(obj: BehaviorObject, ..._args: unknown[]) {
  const {
    path,
    sourceHumanoid,
    sourceHumanoidRootPart,
    state,
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

  // Toggle path finding if stuck for NPC_STUCK_SECONDS
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
        // If inital path-finding failed, try path-finding to mid point.
        const delta = target.sub(position)
        if (delta.Magnitude > 10) {
          let midTarget = position.add(delta.div(2))
          // Try to get around blockages by adding right-vector
          if (state && obj.Blackboard.sourceUserId) {
            const maxRightVector = 10
            const up =
              selectPlayerState(obj.Blackboard.sourceUserId)(state)
                ?.gravityUp ?? new Vector3(0, 1, 0)
            midTarget = midTarget.add(
              delta.Unit.Cross(up).mul(
                maxRightVector * (math.random() * 2 - 1),
              ),
            )
          }
          // Move to midTarget
          const midResult = path.Run(midTarget)
          if (midResult) {
            obj.pathStatus = PathStatus.Running
            return BEHAVIOR_TREE_STATUS.RUNNING
          }
        }

        // Path-finding failed
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
