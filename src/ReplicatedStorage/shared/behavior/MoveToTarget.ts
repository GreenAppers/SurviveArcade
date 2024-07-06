import { Dependency } from '@flamework/core'
import { Logger } from '@rbxts/log'
import { BEHAVIOR_TREE_STATUS } from 'ReplicatedStorage/shared/constants/core'
import { selectPlayerState } from 'ReplicatedStorage/shared/state'
import { PlayerState } from 'ReplicatedStorage/shared/state/PlayersState'
import {
  BehaviorObject,
  getBehaviorTime,
  PathStatus,
  stopPathFinding,
} from 'ReplicatedStorage/shared/utils/behavior'

export const NPC_STUCK_SECONDS = 3
export const NPC_MAX_STUCK_COUNT = 3

const logger = Dependency<Logger>()

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
      obj.pathDisabled = !obj.pathDisabled
      obj.stuckCount = (obj.stuckCount || 0) + 1
      logger.Debug(
        `${sourceHumanoidRootPart.Parent?.Name} stuck for ${NPC_STUCK_SECONDS} seconds ${obj.stuckCount} times` +
          (obj.stuckCount > NPC_MAX_STUCK_COUNT
            ? `, MoveToTarget failed`
            : `, ${obj.pathDisabled ? 'disabling' : 'enabling'} path-finding`),
      )
      if (obj.stuckCount > NPC_MAX_STUCK_COUNT) {
        obj.stuckCount = 0
        return BEHAVIOR_TREE_STATUS.FAIL
      }
    } else {
      obj.stuckCount = 0
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
  const target = targetPosition // .add(targetPosition.sub(position).Unit.mul(2))
  if (path && !obj.pathDisabled) {
    if (obj.pathStatus === PathStatus.Running) {
      return BEHAVIOR_TREE_STATUS.RUNNING
    } else {
      const result = path.Run(target)
      if (result) {
        // logger.Debug(`${sourceHumanoidRootPart.Parent?.Name} MoveToTarget ${target} RUNNING`)
        obj.pathStatus = PathStatus.Running
        return BEHAVIOR_TREE_STATUS.RUNNING
      } else {
        // If inital path-finding failed, try path-finding to mid point.
        const delta = target.sub(position)
        if (delta.Magnitude > 10) {
          let midTarget = position.add(delta.div(2))
          // Try to get around blockages by adding right-vector
          if (state && obj.Blackboard.sourceUserId)
            midTarget = midTarget.add(
              randomRightVector(
                delta,
                selectPlayerState(obj.Blackboard.sourceUserId)(state),
              ),
            )
          // Move to midTarget
          const midResult = path.Run(midTarget)
          if (midResult) {
            // logger.Debug(`${sourceHumanoidRootPart.Parent?.Name} MoveToTarget midpoint ${midTarget} RUNNING`)
            obj.pathStatus = PathStatus.Running
            return BEHAVIOR_TREE_STATUS.RUNNING
          }
        }

        // Path-finding failed
        /* logger.Debug(
          `${sourceHumanoidRootPart.Parent?.Name} MoveToTarget path-finding ` +
            `${obj.pathStatus === PathStatus.Reached ? 'SUCCESS' : 'FAIL'}`,
        ) */
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

export function randomRightVector(
  direction: Vector3,
  playerState?: PlayerState,
) {
  const maxRightVector = 10
  const up = playerState?.gravityUp ?? new Vector3(0, 1, 0)
  return direction.Unit.Cross(up).mul(maxRightVector * (math.random() * 2 - 1))
}
