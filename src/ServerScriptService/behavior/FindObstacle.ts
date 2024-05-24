import { BEHAVIOR_TREE_STATUS } from 'ReplicatedStorage/shared/constants/core'
import { BehaviorObject } from 'ReplicatedStorage/shared/utils/behavior'

export function run(obj: BehaviorObject, ..._args: unknown[]) {
  const { sourceHumanoid, sourceHumanoidRootPart, sourceInstance } =
    obj.Blackboard

  if (sourceHumanoid && sourceHumanoidRootPart) {
    const targetPoint = sourceHumanoid.TargetPoint
    const [obstacle, obstaclePos] = game.Workspace.FindPartOnRayWithIgnoreList(
      new Ray(
        sourceHumanoidRootPart.CFrame.add(
          new CFrame(
            sourceHumanoidRootPart.Position,
            new Vector3(
              targetPoint.X,
              sourceHumanoidRootPart.Position.Y,
              targetPoint.Z,
            ),
          ).LookVector.mul(sourceHumanoidRootPart.Size.Z / 2),
        ).Position,
        sourceHumanoidRootPart.CFrame.LookVector.Unit.mul(
          sourceHumanoidRootPart.Size.Z * 2.5 || 999.999,
        ),
      ),
      sourceInstance ? [sourceInstance] : [],
    )
    if (obstacle && obstaclePos) {
      obj.Blackboard.obstacle = obstacle
      obj.Blackboard.obstaclePos = obstaclePos
      return BEHAVIOR_TREE_STATUS.SUCCESS
    }
  }
  return BEHAVIOR_TREE_STATUS.FAIL
}
