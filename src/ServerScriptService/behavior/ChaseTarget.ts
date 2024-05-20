import { BEHAVIOR_TREE_STATUS } from 'ReplicatedStorage/shared/constants/core'

export function run(obj: BehaviorObject, ..._args: unknown[]) {
  const { sourceHumanoid, sourceHumanoidRootPart, targetHumanoid, targetPart } =
    obj.Blackboard
  obj.notice = true
  if (
    sourceHumanoidRootPart &&
    sourceHumanoid &&
    sourceHumanoid.Health !== 0 &&
    targetPart
  ) {
    if (
      targetHumanoid &&
      targetHumanoid.Health !== 0 &&
      targetPart.Position.sub(sourceHumanoidRootPart.Position).Magnitude > 5
    ) {
      wait(2)
      sourceHumanoid.WalkSpeed = 30
    } else if (
      targetHumanoid &&
      targetHumanoid.Health !== 0 &&
      targetPart.Position.sub(sourceHumanoidRootPart.Position).Magnitude < 5
    ) {
      sourceHumanoid.WalkSpeed = 16
    }
    sourceHumanoid.MoveTo(
      targetPart.Position.add(
        targetPart.Position.sub(sourceHumanoidRootPart.Position).Unit.mul(2),
      ),
      game.Workspace.FindFirstChild('Terrain') as Terrain | undefined,
    )
  }
  return BEHAVIOR_TREE_STATUS.SUCCESS
}
