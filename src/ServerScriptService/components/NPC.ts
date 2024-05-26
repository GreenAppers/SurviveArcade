import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { PathfindingService, Players, Workspace } from '@rbxts/services'
import Path from '@rbxts/simplepath'
import { CHARACTER_CHILD } from 'ReplicatedStorage/shared/constants/core'
import { NPCTag } from 'ReplicatedStorage/shared/constants/tags'
import { BehaviorObject } from 'ReplicatedStorage/shared/utils/behavior'
import { getUserIdFromNPCName } from 'ReplicatedStorage/shared/utils/player'
import { NPCService } from 'ServerScriptService/services/NPCService'
import { store } from 'ServerScriptService/store'

export function getRandomPositionAroundObject(
  object: BasePart,
  radius: number,
) {
  const objectPosition = object.Position
  const randomOffset = new Vector3(
    math.random(-radius, radius),
    0,
    math.random(-radius, radius),
  )
  const randomPosition = objectPosition.add(randomOffset)
  const path = PathfindingService.CreatePath()
  const [success] = pcall(() =>
    path.ComputeAsync(objectPosition, randomPosition),
  )
  if (success && path.Status === Enum.PathStatus.Success) return randomPosition
  else return getRandomPositionAroundObject(object, radius)
}

@Component({ tag: NPCTag })
export class NPCComponent
  extends BaseComponent<NPCAttributes, Model>
  implements OnStart
{
  behavior: BehaviorObject = { Blackboard: {} }
  canJump = true
  height = 5
  humanoid?: Humanoid
  humanoidRootPart?: BasePart
  idleMax = 3
  idleMin = 1
  jumpPower = 50
  mode = 'Idle'
  path?: Path
  radius = 3
  stopDistance = 25
  target?: Vector3
  userId?: number
  walkSpeed = 50

  constructor(protected npcService: NPCService) {
    super()
  }

  onStart() {
    this.humanoid = this.instance.FindFirstChildOfClass('Humanoid')
    this.humanoidRootPart = this.instance.FindFirstChild<BasePart>(
      CHARACTER_CHILD.HumanoidRootPart,
    )
    this.path = new Path(this.instance)
    this.userId = getUserIdFromNPCName(this.instance.Name)

    this.humanoid?.Died?.Connect(() => {
      wait(1)
      this.instance.Destroy()
    })

    while (this.humanoid && this.humanoid.Health > 0 && wait(0.3)[0]) {
      const behaviorTree =
        this.npcService.population[this.attributes.NPCType].behaviorTree
      if (!behaviorTree) continue

      this.behavior.Blackboard = {
        sourceHumanoid: this.humanoid,
        sourceHumanoidRootPart: this.humanoidRootPart,
        sourceInstance: this.instance,
        sourceUserId: this.userId,
        state: store.getState(),
      }

      behaviorTree.run(this.behavior)
    }
  }

  changeMode(newMode: string) {
    if (this.humanoid) {
      this.humanoid.WalkSpeed = this.walkSpeed
      this.humanoid.JumpPower = this.jumpPower
    }
    this.path?.Stop()
    this.mode = newMode
    switch (this.mode) {
      case 'Idle':
        return
      case 'Path':
        this.pathTo()
        return
      case 'Follow':
        this.follow()
        return
      case 'Patrol':
        if (this.target) this.patrol([this.target])
        return
      case 'Wander':
        this.wander()
        return
    }
  }

  pathTo() {
    if (!this.humanoidRootPart || !this.path || !this.target) return
    this.path.Run(this.target)
    while (wait()[0]) {
      const distance = this.humanoidRootPart.Position.sub(this.target).Magnitude
      if (distance <= this.stopDistance || this.mode !== 'Path') break
    }
    this.path.Stop()
    this.mode = 'Idle'
  }

  follow() {
    if (!this.humanoid || !this.humanoidRootPart || !this.path || !this.target)
      return
    this.humanoid.WalkSpeed = this.walkSpeed
    this.humanoid.JumpPower = this.jumpPower
    for (;;) {
      const distance = this.humanoidRootPart.Position.sub(this.target).Magnitude
      this.path.Run(this.target)
      if (this.mode !== 'Follow') {
        this.path.Stop()
        return
      }
      if (distance <= this.stopDistance) {
        this.humanoid.WalkSpeed = 0
        this.humanoid.JumpPower = 0
      } else if (distance >= this.stopDistance) {
        this.humanoid.WalkSpeed = this.walkSpeed
        this.humanoid.JumpPower = this.jumpPower
      }
    }
  }

  patrol(targets: Vector3[]) {
    if (!this.humanoid || !this.humanoidRootPart || !this.path || !this.target)
      return
    this.humanoid.WalkSpeed = this.walkSpeed
    this.humanoid.JumpPower = this.jumpPower
    while (this.mode === 'Patrol') {
      const randomTarget =
        targets[new Random().NextInteger(0, targets.size() - 1)]
      this.path.Run(randomTarget)
      let reached = false
      const reachedconn = this.path.Reached.Connect(() => {
        reached = true
      })
      while (reached === false) wait(1)
      reachedconn.Disconnect()
      if (this.mode !== 'Patrol') break
      wait(new Random().NextNumber(this.idleMin, this.idleMax))
    }
  }

  wander() {
    if (!this.humanoid || !this.humanoidRootPart || !this.path || !this.target)
      return
    this.humanoid.WalkSpeed = this.walkSpeed
    this.humanoid.JumpPower = this.jumpPower
    while (this.mode === 'Wander') {
      const randomTarget = new Instance('Part', Workspace)
      randomTarget.Position = getRandomPositionAroundObject(
        this.humanoidRootPart,
        100,
      )
      randomTarget.Anchored = true
      randomTarget.CanQuery = false
      randomTarget.CanTouch = false
      randomTarget.CanCollide = false
      this.path.Run(randomTarget)
      randomTarget.Destroy()

      let reached = false
      const reachedconn = this.path.Reached.Connect(() => {
        reached = true
      })
      while (reached === false) wait(1)
      reachedconn.Disconnect()
      if (this.mode !== 'Wander') break
      wait(new Random().NextNumber(this.idleMin, this.idleMax))
    }
  }
}

export function searchForPlayer(
  character: Instance,
  coneLength: number,
  angle: number,
) {
  const coneAngle = math.rad(angle)
  const head = character.FindFirstChild<BasePart>('Head')
  if (!head) return undefined

  const headPosition = head.Position
  const headOrientation = head.CFrame.LookVector
  for (const player of Players.GetPlayers()) {
    const humanoidRootPart =
      player.Character?.FindFirstChild<BasePart>('HumanoidRootPart')
    if (!humanoidRootPart) continue
    const playerPosition = humanoidRootPart.Position
    const direction = playerPosition.sub(headPosition).Unit
    const angle = math.acos(headOrientation.Dot(direction))
    const distance = playerPosition.sub(headPosition).Magnitude
    if (angle <= coneAngle && distance <= coneLength) return player
  }

  return undefined
}
