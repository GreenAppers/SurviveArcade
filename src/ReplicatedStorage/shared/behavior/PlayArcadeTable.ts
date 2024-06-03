import { BEHAVIOR_TREE_STATUS } from 'ReplicatedStorage/shared/constants/core'
import { selectArcadeTableState } from 'ReplicatedStorage/shared/state'
import { ArcadeTableStatus } from 'ReplicatedStorage/shared/state/ArcadeTablesState'
import { flipPinballFlipper } from 'ReplicatedStorage/shared/utils/arcade'
import {
  BehaviorObject,
  waitAfterBehaviorCompleted,
} from 'ReplicatedStorage/shared/utils/behavior'

export function run(obj: BehaviorObject, ..._args: unknown[]) {
  const { sourceArcadeTableName, sourceHumanoid, sourceUserId, state } =
    obj.Blackboard
  if (!sourceArcadeTableName || !sourceUserId || !state)
    return BEHAVIOR_TREE_STATUS.FAIL

  const arcadeTable = game.Workspace.ArcadeTables[sourceArcadeTableName]
  const arcadeTableState = selectArcadeTableState(sourceArcadeTableName)(state)
  if (
    !arcadeTable ||
    !arcadeTableState ||
    arcadeTableState.owner !== sourceUserId
  )
    return BEHAVIOR_TREE_STATUS.FAIL

  if (arcadeTableState.status === ArcadeTableStatus.Won) {
    if (!waitAfterBehaviorCompleted(obj, 3)) return BEHAVIOR_TREE_STATUS.SUCCESS
    if (sourceHumanoid) sourceHumanoid.Jump = true
    return BEHAVIOR_TREE_STATUS.SUCCESS
  }

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
    if (ballPosition.sub(leftFlipperPosition).Magnitude < 10) {
      flipPinballFlipper(arcadeTable, 'FlipperLeft')
    } else if (ballPosition.sub(rightFlipperPosition).Magnitude < 10) {
      flipPinballFlipper(arcadeTable, 'FlipperRight')
    }
  }

  return BEHAVIOR_TREE_STATUS.RUNNING
}
