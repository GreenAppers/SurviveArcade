import SimplePath from '@rbxts/simplepath'
import {
  ClientNetworkEvents,
  ServerNetworkEvents,
} from 'ReplicatedStorage/shared/network'
import { SharedState, SharedStore } from 'ReplicatedStorage/shared/state'

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
  targetSeat?: Seat
  type: BehaviorPlanType
}

export type BehaviorPlans = Partial<Record<BehaviorPlanType, BehaviorPlan>>

export interface BehaviorObject {
  attackDebounce?: boolean
  Blackboard: Record<string, unknown> & {
    clientNetwork?: ClientNetworkEvents
    lastFlipperLeft?: number
    lastFlipperRight?: number
    obstacle?: BasePart
    obstaclePos?: Vector3
    path?: SimplePath
    plan?: BehaviorPlans
    serverNetwork?: ServerNetworkEvents
    serverStore?: SharedStore
    sourceArcadeTableName?: ArcadeTableName
    sourceAttachment?: Attachment
    sourceHumanoid?: Humanoid
    sourceHumanoidRootPart?: BasePart
    sourceInstance?: Instance
    sourceSpawnNumber?: number
    sourceTeamName?: string
    sourceUserId?: number
    status?: string
    state?: SharedState
    targetAttachment?: Attachment
    targetPart?: BasePart
    targetHumanoid?: Humanoid
    targetHumanoidRootPart?: BasePart
    targetSeat?: Seat
    time?: number
    teamName?: string
  }
  pathDisabled?: boolean
  pathError?: string
  pathStatus?: PathStatus
  previousPosition?: Vector3
  previousPositionTime?: number
  previousRunningTime?: number
  startedRunningTime?: number
  stuckCount?: number
  treeRunning: boolean
}

export function addBehaviorPlan(obj: BehaviorObject, plan: BehaviorPlan) {
  if (!obj.Blackboard.plan) obj.Blackboard.plan = {}
  obj.Blackboard.plan[plan.type] = plan
  obj.Blackboard.status = plan.status
  obj.Blackboard.targetAttachment = plan.targetAttachment
}

export function getBehaviorTime(obj: BehaviorObject) {
  if (!obj.Blackboard.time) obj.Blackboard.time = time()
  return obj.Blackboard.time
}

export function waitAfterBehaviorCompleted(
  obj: BehaviorObject,
  secondsAgo: number,
) {
  if (!obj.previousRunningTime) return true
  return secondsAgo < getBehaviorTime(obj) - obj.previousRunningTime
}

export function stopPathFinding(obj: BehaviorObject) {
  if (obj.pathStatus === PathStatus.Running && obj.Blackboard.path)
    obj.Blackboard.path.Stop()
  obj.pathStatus = PathStatus.Stopped
}
