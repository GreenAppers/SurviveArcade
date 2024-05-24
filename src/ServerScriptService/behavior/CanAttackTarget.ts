import { BEHAVIOR_TREE_STATUS } from 'ReplicatedStorage/shared/constants/core'
import { BehaviorObject } from 'ReplicatedStorage/shared/utils/behavior'

function raycastThroughTools(
  position: Vector3,
  direction: Vector3,
  currentDistance: number,
  ignore?: Instance,
): [BasePart?, Vector3?] {
  const [hit2, pos2] = game.Workspace.FindPartOnRay(
    new Ray(position.add(direction.mul(0.05)), direction.mul(currentDistance)),
    ignore,
  )
  if (
    hit2 &&
    pos2 &&
    ((hit2.Name === 'Handle' && !hit2.CanCollide) ||
      (hit2.Name.sub(1, 6) === 'Effect' && !hit2.CanCollide))
  ) {
    currentDistance -= pos2.sub(position).Magnitude
    return raycastThroughTools(pos2, direction, currentDistance, ignore)
  }
  return [hit2, pos2]
}

export function run(obj: BehaviorObject, ..._args: unknown[]) {
  const {
    sourceHumanoidRootPart,
    sourceInstance,
    targetHumanoid,
    targetHumanoidRootPart,
  } = obj.Blackboard
  if (!sourceHumanoidRootPart || !targetHumanoid || !targetHumanoidRootPart)
    return BEHAVIOR_TREE_STATUS.FAIL
  const [hit, _pos] = raycastThroughTools(
    sourceHumanoidRootPart.Position,
    targetHumanoidRootPart.Position.sub(sourceHumanoidRootPart.Position).Unit,
    500,
    sourceInstance,
  )
  return hit &&
    hit.Parent &&
    hit.Parent.IsA('Model') &&
    hit.Parent.FindFirstChild('HumanoidRootPart') &&
    hit.Parent.FindFirstChild('Head') &&
    targetHumanoid &&
    targetHumanoid.Health !== 0 &&
    targetHumanoidRootPart &&
    targetHumanoidRootPart.Position.sub(sourceHumanoidRootPart.Position)
      .Magnitude < 9 &&
    !obj.attackDebounce
    ? BEHAVIOR_TREE_STATUS.SUCCESS
    : BEHAVIOR_TREE_STATUS.FAIL
}
