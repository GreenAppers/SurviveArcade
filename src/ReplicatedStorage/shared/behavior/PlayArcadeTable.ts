import { BEHAVIOR_TREE_STATUS } from 'ReplicatedStorage/shared/constants/core'
import { selectArcadeTableState } from 'ReplicatedStorage/shared/state'
import { ArcadeTableStatus } from 'ReplicatedStorage/shared/state/ArcadeTablesState'
import { flipPinballFlipper } from 'ReplicatedStorage/shared/utils/arcade'
import {
  BehaviorObject,
  getBehaviorTime,
  waitAfterBehaviorCompleted,
} from 'ReplicatedStorage/shared/utils/behavior'

const flipperCooldown = 0.3
const flipperFireDistance = 7

export function run(obj: BehaviorObject, ..._args: unknown[]) {
  const { sourceArcadeTableName, sourceHumanoid, sourceUserId, state } =
    obj.Blackboard
  if (!sourceArcadeTableName || !sourceHumanoid || !sourceUserId || !state)
    return BEHAVIOR_TREE_STATUS.FAIL

  const arcadeTable = game.Workspace.ArcadeTables[sourceArcadeTableName]
  const arcadeTableState = selectArcadeTableState(sourceArcadeTableName)(state)
  if (!arcadeTable || !arcadeTableState) return BEHAVIOR_TREE_STATUS.FAIL

  // If we just won, wait for the winning sequence to finish, then jump.
  if (arcadeTableState.status === ArcadeTableStatus.Won) {
    if (!waitAfterBehaviorCompleted(obj, 3)) return BEHAVIOR_TREE_STATUS.SUCCESS
    sourceHumanoid.Jump = true
    return BEHAVIOR_TREE_STATUS.SUCCESS
  }

  if (arcadeTableState.owner !== sourceUserId) return BEHAVIOR_TREE_STATUS.FAIL

  const leftFlipperPosition =
    arcadeTable.FlipperLeft.Flipper.Wedge2.CFrame.ToWorldSpace(
      new CFrame(),
    ).Position
  const rightFlipperPosition =
    arcadeTable.FlipperRight.Flipper.Wedge1.CFrame.ToWorldSpace(
      new CFrame(),
    ).Position
  for (const ball of arcadeTable.Balls.GetChildren<BasePart>()) {
    const ballPosition = ball.CFrame.ToWorldSpace(new CFrame()).Position
    const leftDistance = ballPosition.sub(leftFlipperPosition).Magnitude
    const rightDistance = ballPosition.sub(rightFlipperPosition).Magnitude
    if (
      leftDistance < flipperFireDistance ||
      rightDistance < flipperFireDistance
    ) {
      const time = getBehaviorTime(obj)
      if (
        leftDistance < rightDistance &&
        time - (obj.Blackboard.lastFlipperLeft ?? 0) > flipperCooldown
      ) {
        flipPinballFlipper(arcadeTable, 'FlipperLeft')
        obj.Blackboard.lastFlipperLeft = time
      } else if (
        time - (obj.Blackboard.lastFlipperRight ?? 0) >
        flipperCooldown
      ) {
        flipPinballFlipper(arcadeTable, 'FlipperRight')
        obj.Blackboard.lastFlipperRight = time
      }
    }
  }

  return BEHAVIOR_TREE_STATUS.RUNNING
}
