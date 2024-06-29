import { BEHAVIOR_TREE_STATUS } from 'ReplicatedStorage/shared/constants/core'
import { BehaviorObject } from 'ReplicatedStorage/shared/utils/behavior'
import { takeDamage } from 'ServerScriptService/utils/player'

export function run(obj: BehaviorObject, ..._args: unknown[]) {
  const {
    sourceHumanoid,
    sourceHumanoidRootPart,
    sourceInstance,
    sourceUserId,
    targetHumanoid,
    targetPart,
  } = obj.Blackboard
  obj.attackDebounce = true
  const swing = sourceInstance?.FindFirstChild('Swing')
  const swingAnimation =
    swing && swing.IsA('Animation')
      ? sourceHumanoid?.LoadAnimation(swing)
      : undefined
  swingAnimation?.Play()
  swingAnimation?.AdjustSpeed(1.5 + math.random() * 0.1)
  wait(0.3)
  if (
    targetPart &&
    targetHumanoid &&
    targetHumanoid.Health !== 0 &&
    sourceHumanoidRootPart &&
    targetPart.Position.sub(sourceHumanoidRootPart.Position).Magnitude < 5
  ) {
    takeDamage(targetHumanoid, math.huge, sourceUserId)
  }
  wait(0.1)
  obj.attackDebounce = false
  return BEHAVIOR_TREE_STATUS.SUCCESS
}
