import { SharedState } from 'ReplicatedStorage/shared/state'

export enum BehaviorPlanType {
  Arcade,
  Tycoon,
}

export interface BehaviorPlan {
  status: string
  targetAttachment: Attachment
  type: BehaviorPlanType
}

export type BehaviorPlans = Partial<Record<BehaviorPlanType, BehaviorPlan>>

export interface BehaviorObject {
  attackDebounce?: boolean
  Blackboard: Record<string, unknown> & {
    status?: string
    state?: SharedState
    obstacle?: BasePart
    obstaclePos?: Vector3
    plan?: BehaviorPlans
    sourceAttachment?: Attachment
    sourceHumanoid?: Humanoid
    sourceHumanoidRootPart?: BasePart
    sourceInstance?: Instance
    sourceTeamName?: string
    sourceUserId?: number
    targetAttachment?: Attachment
    targetPart?: BasePart
    targetHumanoid?: Humanoid
    targetHumanoidRootPart?: BasePart
    teamName?: string
  }
  notice?: boolean
  noticeDebounce?: boolean
}

export function addBehaviorPlan(obj: BehaviorObject, plan: BehaviorPlan) {
  if (!obj.Blackboard.plan) obj.Blackboard.plan = {}
  obj.Blackboard.plan[plan.type] = plan
  obj.Blackboard.status = plan.status
  obj.Blackboard.targetAttachment = plan.targetAttachment
}
