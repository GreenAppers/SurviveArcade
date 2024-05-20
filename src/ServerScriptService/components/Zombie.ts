import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { DIFFICULTY_TYPES } from 'ReplicatedStorage/shared/constants/core'
import { ZombieTag } from 'ReplicatedStorage/shared/constants/tags'
import { selectDifficulty } from 'ReplicatedStorage/shared/state'
import { store } from 'ServerScriptService/store'
import { findChildHumanoid } from 'ServerScriptService/utils/instance'

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

// Adapted from code --[[ By: Brutez. ]]--
@Component({ tag: ZombieTag })
export class ZombieComponent
  extends BaseComponent<{}, Model>
  implements OnStart
{
  humanoid?: Humanoid
  humanoidRootPart?: BasePart
  head?: BasePart
  knife?: BasePart
  attackDebounce = false
  noticeDebounce = false
  notice = false
  respawndant: Model | undefined

  onStart() {
    this.respawndant = this.instance.Clone()
    this.knife = this.instance.FindFirstChild('Knife') as BasePart | undefined
    this.head = this.instance.FindFirstChild('Head') as BasePart | undefined
    this.humanoidRootPart = this.instance.FindFirstChild('HumanoidRootPart') as
      | BasePart
      | undefined
    this.humanoid = findChildHumanoid(this.instance)
    if (this.humanoid) {
      store.subscribe(selectDifficulty(), (difficulty) => {
        if (difficulty === DIFFICULTY_TYPES.peaceful) {
          this.humanoid?.TakeDamage(math.huge)
        } else if (this.humanoid?.Health === 0) {
          this.respawn()
        }
      })
      this.humanoid.Died.Connect(() => {
        if (!this.respawndant) return
        wait(0.1)
        this.respawn()
      })
    }
    this.mainLoop()
  }

  mainLoop() {
    /*
          const behaviorObject = {
      sourceAttachment: rootRigAttachment,
      teamName: localPlayerTeamName,
    }
    const result = this.guide.run(behaviorObject, 'extra-arg-1', 'extra-arg-2')
    print('btreeeez', result, behaviorObject)
    */
    if (!this.humanoid || !this.humanoidRootPart) return
    while (wait(0)[0]) {
      const [blockage, blockagePos] = this.findBlockage()
      if (blockage) this.handleBlockage(blockage, blockagePos)

      const [targetPart, targetHumanoid, targetHumanoidRootPart] =
        this.findNearestTarget()

      if (targetPart && targetHumanoid && targetHumanoidRootPart) {
        this.jumpIfTargetJumps(targetPart, targetHumanoid)

        if (this.canAttackTarget(targetHumanoid, targetHumanoidRootPart)) {
          spawn(() => this.attackTarget(targetHumanoidRootPart, targetHumanoid))
        }

        this.chaseTarget(targetPart, targetHumanoid)
      } else {
        this.wanderAround()
      }

      this.updateHumanoid()
    }
  }

  respawn() {
    if (
      !this.respawndant ||
      selectDifficulty()(store.getState()) === DIFFICULTY_TYPES.peaceful
    )
      return
    const respawndant = this.respawndant.Clone()
    // respawndant.MakeJoints()
    // respawndant.FindFirstChild('Head')?.MakeJoints()
    // respawndant.FindFirstChild('Torso')?.MakeJoints()
    respawndant.Parent = this.instance.Parent
  }

  findBlockage(): [BasePart | undefined, Vector3] {
    if (!this.humanoid || !this.humanoidRootPart)
      return [undefined, new Vector3()]
    const TargetPoint = this.humanoid.TargetPoint
    const [Blockage, BlockagePos] = game.Workspace.FindPartOnRayWithIgnoreList(
      new Ray(
        this.humanoidRootPart.CFrame.add(
          new CFrame(
            this.humanoidRootPart.Position,
            new Vector3(
              TargetPoint.X,
              this.humanoidRootPart.Position.Y,
              TargetPoint.Z,
            ),
          ).LookVector.mul(this.humanoidRootPart.Size.Z / 2),
        ).Position,
        this.humanoidRootPart.CFrame.LookVector.Unit.mul(
          this.humanoidRootPart.Size.Z * 2.5 || 999.999,
        ),
      ),
      [this.instance],
    )
    return [Blockage, BlockagePos]
  }

  handleBlockage(blockage: BasePart, blockagePos: Vector3) {
    let jumpable = true
    if (
      blockage &&
      blockage.Parent &&
      blockage.Parent.ClassName !== 'Workspace'
    ) {
      const blockageHumanoid = findChildHumanoid(blockage.Parent)
      if (blockage && blockage.IsA('Terrain')) {
        const CellPos = blockage.WorldToCellPreferSolid(
          blockagePos.sub(new Vector3(0, 2, 0)),
        )
        const [CellMaterial] = <[Enum.CellMaterial]>(
          blockage.GetCell(CellPos.X, CellPos.Y, CellPos.Z)
        )
        if (CellMaterial === Enum.CellMaterial.Water) {
          jumpable = false
        }
      } else if (
        blockageHumanoid ||
        blockage.ClassName === 'TrussPart' ||
        blockage.ClassName === 'WedgePart' ||
        (blockage.Name === 'Handle' && blockage.Parent.ClassName === 'Hat') ||
        (blockage.Name === 'Handle' && blockage.Parent.ClassName === 'Tool')
      ) {
        jumpable = false
      }
    }
    if (
      this.instance &&
      this.humanoid &&
      this.humanoid.Health !== 0 &&
      !this.humanoid.Sit &&
      jumpable
    ) {
      this.humanoid.Jump = true
    }
  }

  findNearestTarget(): [BasePart?, Humanoid?, BasePart?] {
    let minDistance = math.huge
    let minDistanceTargetPart
    let minDistanceHumanoid
    let minDistanceHumanoidRootPart
    for (const targetModel of game.Workspace.GetChildren()) {
      if (
        this.humanoid &&
        this.humanoidRootPart &&
        this.humanoid.Health !== 0 &&
        targetModel.IsA('Model') &&
        targetModel !== this.instance &&
        targetModel.Name !== this.instance.Name &&
        targetModel.FindFirstChild('HumanoidRootPart') &&
        targetModel.FindFirstChild('Head')
      ) {
        const targetHumanoid = findChildHumanoid(targetModel)
        const targetHumanoidRootPart = targetModel.FindFirstChild(
          'HumanoidRootPart',
        ) as BasePart | undefined
        if (
          targetHumanoid &&
          targetHumanoid.Health !== 0 &&
          targetHumanoidRootPart &&
          targetHumanoidRootPart.Position.sub(this.humanoidRootPart.Position)
            .Magnitude < minDistance
        ) {
          minDistanceHumanoid = targetHumanoid
          minDistanceHumanoidRootPart = targetHumanoidRootPart
          minDistanceTargetPart = targetHumanoidRootPart
          minDistance = targetHumanoidRootPart.Position.sub(
            this.humanoidRootPart.Position,
          ).Magnitude
        }
      }
    }
    return [
      minDistanceTargetPart,
      minDistanceHumanoid,
      minDistanceHumanoidRootPart,
    ]
  }

  jumpIfTargetJumps(targetPart?: BasePart, targetHumanoid?: Humanoid) {
    // Jump when target jumps
    if (
      this.instance &&
      this.humanoid &&
      this.humanoid.Health !== 0 &&
      targetPart &&
      targetPart.Parent &&
      targetHumanoid &&
      targetHumanoid.Jump
    ) {
      this.humanoid.Jump = true
    }
  }

  canAttackTarget(
    targetHumanoid?: Humanoid,
    targetHumanoidRootPart?: BasePart,
  ) {
    if (!targetHumanoid || !targetHumanoidRootPart || !this.humanoidRootPart)
      return false
    const [hit, _pos] = raycastThroughTools(
      this.humanoidRootPart.Position,
      targetHumanoidRootPart.Position.sub(this.humanoidRootPart.Position).Unit,
      500,
      this.instance,
    )
    return (
      hit &&
      hit.Parent &&
      hit.Parent.IsA('Model') &&
      hit.Parent.FindFirstChild('HumanoidRootPart') &&
      hit.Parent.FindFirstChild('Head') &&
      targetHumanoid &&
      targetHumanoid.Health !== 0 &&
      targetHumanoidRootPart &&
      targetHumanoidRootPart.Position.sub(this.humanoidRootPart.Position)
        .Magnitude < 9 &&
      !this.attackDebounce
    )
  }

  attackTarget(targetPart: BasePart, targetHumanoid: Humanoid) {
    this.attackDebounce = true
    const swing = this.instance.FindFirstChild('Swing')
    const swingAnimation =
      swing && swing.IsA('Animation')
        ? this.humanoid?.LoadAnimation(swing)
        : undefined
    swingAnimation?.Play()
    swingAnimation?.AdjustSpeed(1.5 + math.random() * 0.1)
    wait(0.3)
    if (
      targetPart &&
      targetHumanoid &&
      targetHumanoid.Health !== 0 &&
      this.humanoidRootPart &&
      targetPart.Position.sub(this.humanoidRootPart.Position).Magnitude < 5
    ) {
      targetHumanoid.TakeDamage(math.huge)
    }
    wait(0.1)
    this.attackDebounce = false
  }

  chaseTarget(targetPart: BasePart, targetHumanoid?: Humanoid) {
    this.notice = true
    if (!this.humanoid || !this.humanoidRootPart || this.humanoid.Health === 0)
      return
    if (
      targetHumanoid &&
      targetHumanoid.Health !== 0 &&
      targetPart.Position.sub(this.humanoidRootPart.Position).Magnitude > 5
    ) {
      wait(2)
      this.humanoid.WalkSpeed = 30
    } else if (
      targetHumanoid &&
      targetHumanoid.Health !== 0 &&
      targetPart.Position.sub(this.humanoidRootPart.Position).Magnitude < 5
    ) {
      this.humanoid.WalkSpeed = 16
    }
    this.humanoid.MoveTo(
      targetPart.Position.add(
        targetPart.Position.sub(this.humanoidRootPart.Position).Unit.mul(2),
      ),
      game.Workspace.FindFirstChild('Terrain') as Terrain | undefined,
    )
  }

  wanderAround() {
    this.notice = false
    this.noticeDebounce = false
    const randomWalk = math.random(1, 150)
    if (this.instance && this.humanoid && this.humanoid.Health !== 0) {
      const terrain = game.Workspace.FindFirstChild('Terrain') as
        | Terrain
        | undefined
      this.humanoid.WalkSpeed = 16
      if (terrain && randomWalk === 1) {
        this.humanoid.MoveTo(
          terrain.Position.add(
            new Vector3(math.random(-2048, 2048), 0, math.random(-2048, 2048)),
          ),
          terrain,
        )
      }
    }
  }

  updateHumanoid() {
    /*
    if (!this.instance || !this.humanoid) return
    this.humanoid.DisplayDistanceType = Enum.HumanoidDisplayDistanceType.None
    this.humanoid.HealthDisplayDistance = 0
    this.humanoid.Name = 'Humanoid'
    this.humanoid.NameDisplayDistance = 0
    this.humanoid.NameOcclusion = Enum.NameOcclusion.EnemyOcclusion
    this.humanoid.AutoJumpEnabled = true
    this.humanoid.AutoRotate = true
    this.humanoid.MaxHealth = math.huge
    this.humanoid.JumpPower = 67
    this.humanoid.MaxSlopeAngle = 89.9
    if (!this.humanoid.AutoJumpEnabled) this.humanoid.AutoJumpEnabled = true
    if (!this.humanoid.AutoRotate) this.humanoid.AutoRotate = true
    if (this.humanoid.PlatformStand) this.humanoid.PlatformStand = false
    if (this.humanoid.Sit) this.humanoid.Sit = false*/
  }
}
