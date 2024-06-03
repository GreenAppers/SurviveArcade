import SimplePath from '@rbxts/simplepath'
import { SharedState } from 'ReplicatedStorage/shared/state'

export enum PathStatus {
  Running = 0,
  Reached = 1,
  Blocked = 2,
  Error = 3,
  Stopped = 4,
}

export enum BehaviorPlanType {
  Arcade = 1,
  Tycoon = 2,
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
    obstacle?: BasePart
    obstaclePos?: Vector3
    path?: SimplePath
    plan?: BehaviorPlans
    sourceArcadeTableName?: ArcadeTableName
    sourceAttachment?: Attachment
    sourceHumanoid?: Humanoid
    sourceHumanoidRootPart?: BasePart
    sourceInstance?: Instance
    sourceTeamName?: string
    sourceUserId?: number
    status?: string
    state?: SharedState
    targetAttachment?: Attachment
    targetPart?: BasePart
    targetHumanoid?: Humanoid
    targetHumanoidRootPart?: BasePart
    teamName?: string
  }
  lastRunning?: number
  notice?: boolean
  noticeDebounce?: boolean
  pathError?: string
  pathStatus?: PathStatus
}

export function addBehaviorPlan(obj: BehaviorObject, plan: BehaviorPlan) {
  if (!obj.Blackboard.plan) obj.Blackboard.plan = {}
  obj.Blackboard.plan[plan.type] = plan
  obj.Blackboard.status = plan.status
  obj.Blackboard.targetAttachment = plan.targetAttachment
}

export function waitAfterBehaviorCompleted(
  obj: BehaviorObject,
  secondsAgo: number,
) {
  if (!obj.lastRunning) return true
  return secondsAgo < time() - obj.lastRunning
}
