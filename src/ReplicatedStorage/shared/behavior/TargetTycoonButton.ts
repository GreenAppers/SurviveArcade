import {
  BEHAVIOR_TREE_STATUS,
  TYCOON_ATTRIBUTES,
} from 'ReplicatedStorage/shared/constants/core'
import {
  selectPlayerState,
  selectTycoonsState,
} from 'ReplicatedStorage/shared/state'
import {
  getPlayerCurrency,
  PlayerState,
} from 'ReplicatedStorage/shared/state/PlayersState'
import { findTycoonNameOwnedBy } from 'ReplicatedStorage/shared/state/TycoonState'
import {
  addBehaviorPlan,
  BehaviorObject,
  BehaviorPlan,
  BehaviorPlanType,
} from 'ReplicatedStorage/shared/utils/behavior'
import { getCurrency } from 'ReplicatedStorage/shared/utils/currency'
import { formatMessage, MESSAGE } from 'ReplicatedStorage/shared/utils/messages'
import {
  getTycoonType,
  tycoonConstants,
} from 'ReplicatedStorage/shared/utils/tycoon'

function findTycoonButtonTarget(
  tycoonName: TycoonName,
  playerState?: PlayerState,
): Attachment | undefined {
  const tycoon = game.Workspace.Tycoons[tycoonName]
  const tycoonType = getTycoonType(
    tycoon?.GetAttribute(TYCOON_ATTRIBUTES.TycoonType),
  )
  if (!tycoon || !tycoonType || !playerState) return undefined

  const constants = tycoonConstants[tycoonType]
  for (const button of tycoon.Buttons.GetChildren() as TycoonButtonModel[]) {
    if (button.Button.CanTouch === false) continue
    const details = constants.Buttons[button.Name]
    const currency = getCurrency(details.Currency)
    const cost = details.Cost
    if (cost && currency && getPlayerCurrency(playerState, currency) >= cost)
      return button.Button.Attachment
  }
  return undefined
}

export function run(obj: BehaviorObject, ..._args: unknown[]) {
  const { sourceAttachment, sourceUserId, state } = obj.Blackboard
  if (!sourceAttachment || !sourceUserId || !state)
    return BEHAVIOR_TREE_STATUS.SUCCESS

  const tycoonsState = selectTycoonsState()(state)
  const tycoonName = findTycoonNameOwnedBy(tycoonsState, sourceUserId)
  if (!tycoonName) return BEHAVIOR_TREE_STATUS.SUCCESS

  const playerState = selectPlayerState(sourceUserId)(state)
  const targetAttachment = findTycoonButtonTarget(tycoonName, playerState)
  if (!targetAttachment) return BEHAVIOR_TREE_STATUS.SUCCESS

  const plan: BehaviorPlan = {
    status: formatMessage(MESSAGE.GuideBuildTycoon),
    targetAttachment,
    type: BehaviorPlanType.Tycoon,
  }
  addBehaviorPlan(obj, plan)

  return BEHAVIOR_TREE_STATUS.SUCCESS
}
