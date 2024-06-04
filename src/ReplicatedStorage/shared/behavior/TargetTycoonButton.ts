import {
  BEHAVIOR_TREE_STATUS,
  GUIDE_CURRENCY_ORDER,
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
  greedy?: boolean,
): Attachment | undefined {
  const tycoon = game.Workspace.Tycoons[tycoonName]
  const tycoonType = getTycoonType(
    tycoon?.GetAttribute(TYCOON_ATTRIBUTES.TycoonType),
  )
  if (!tycoon || !tycoonType || !playerState) return undefined

  const constants = tycoonConstants[tycoonType]
  const minCost: Record<string, { attachment: Attachment; cost: number }> = {}
  for (const button of tycoon.Buttons.GetChildren<TycoonButtonModel>()) {
    if (button.Button.CanTouch === false) continue
    const details = constants.Buttons[button.Name]
    const currency = getCurrency(details.Currency)
    if (!currency) continue
    const cost = details.Cost
    const existing = minCost[currency]
    if (
      cost &&
      getPlayerCurrency(playerState, currency) >= cost &&
      (!existing || cost < existing.cost)
    ) {
      if (greedy) return button.Button.Attachment
      if (existing) {
        existing.attachment = button.Button.Attachment
        existing.cost = cost
      } else {
        minCost[currency] = { attachment: button.Button.Attachment, cost }
      }
    }
  }

  for (const currency of GUIDE_CURRENCY_ORDER) {
    const minCostForCurrency = minCost[currency]
    if (minCostForCurrency) return minCostForCurrency.attachment
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
