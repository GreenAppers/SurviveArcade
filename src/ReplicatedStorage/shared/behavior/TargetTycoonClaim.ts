import {
  BEHAVIOR_TREE_STATUS,
  TYCOON_NAMES,
} from 'ReplicatedStorage/shared/constants/core'
import { selectTycoonsState } from 'ReplicatedStorage/shared/state'
import { TycoonsState } from 'ReplicatedStorage/shared/state/TycoonState'
import {
  addBehaviorPlan,
  BehaviorObject,
  BehaviorPlan,
  BehaviorPlanType,
} from 'ReplicatedStorage/shared/utils/behavior'
import { findDescendentWithPath } from 'ReplicatedStorage/shared/utils/instance'
import { formatMessage, MESSAGE } from 'ReplicatedStorage/shared/utils/messages'

export function nearestTycoonPlot(
  position: Vector3,
  tycoonsState?: TycoonsState,
) {
  let nearestDistance = math.huge
  let nearestTycoonName: TycoonName | undefined
  for (const name of TYCOON_NAMES) {
    if (tycoonsState?.[name]?.owner) continue
    const tycoon = game.Workspace.Map[name]
    if (!tycoon) continue
    const distance = position.sub(tycoon.Baseplate.Position).Magnitude
    if (distance < nearestDistance) {
      nearestTycoonName = name
      nearestDistance = distance
    }
  }
  return nearestTycoonName
}

function findTycoonTarget(
  tycoonsState: TycoonsState,
  rootRigAttachment: Attachment,
): Attachment | undefined {
  // Find nearest Tycoon Plot
  const tycoonName = nearestTycoonPlot(
    rootRigAttachment.WorldPosition,
    tycoonsState,
  )
  if (!tycoonName) return undefined
  return findDescendentWithPath<Attachment>(game.Workspace.Map[tycoonName], [
    'ClaimTycoon',
    'Button',
    'Attachment',
  ])
}

export function run(obj: BehaviorObject, ..._args: unknown[]) {
  const { sourceAttachment, sourceUserId, state } = obj.Blackboard
  if (!sourceAttachment || !sourceUserId || !state)
    return BEHAVIOR_TREE_STATUS.FAIL

  const tycoonsState = selectTycoonsState()(state)
  const targetAttachment = findTycoonTarget(tycoonsState, sourceAttachment)
  if (!targetAttachment) return BEHAVIOR_TREE_STATUS.FAIL

  const plan: BehaviorPlan = {
    status: formatMessage(MESSAGE.GuideClaimTycoon),
    targetAttachment,
    type: BehaviorPlanType.Tycoon,
  }
  addBehaviorPlan(obj, plan)

  return BEHAVIOR_TREE_STATUS.SUCCESS
}
