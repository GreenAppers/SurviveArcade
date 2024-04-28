import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { DIFFICULTY_TYPES } from 'ReplicatedStorage/shared/constants/core'
import { ZombieTag } from 'ReplicatedStorage/shared/constants/tags'
import { selectDifficulty } from 'ReplicatedStorage/shared/state'
import { store } from 'ServerScriptService/store'

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

  raycast(
    sPos: Vector3,
    vec: Vector3,
    currentdist: number,
  ): [BasePart?, Vector3?] {
    const [hit2, pos2] = game.Workspace.FindPartOnRay(
      new Ray(sPos.add(vec.mul(0.05)), vec.mul(currentdist)),
      this.instance,
    )
    if (
      hit2 &&
      pos2 &&
      ((hit2.Name === 'Handle' && !hit2.CanCollide) ||
        (hit2.Name.sub(1, 6) === 'Effect' && !hit2.CanCollide))
    ) {
      currentdist -= pos2.sub(sPos).Magnitude
      return this.raycast(pos2, vec, currentdist)
    }
    return [hit2, pos2]
  }

  RayCast(
    position: Vector3,
    direction: Vector3,
    maxDistance: number,
    IgnoreList: Instance[],
  ) {
    return game.Workspace.FindPartOnRayWithIgnoreList(
      new Ray(position, direction.Unit.mul(maxDistance || 999.999)),
      IgnoreList,
    )
  }

  findNearestBae() {
    let NoticeDistance = math.huge
    let TargetMain
    for (const TargetModel of game.Workspace.GetChildren()) {
      if (
        this.instance &&
        this.humanoid &&
        this.humanoidRootPart &&
        this.humanoid.Health !== 0 &&
        TargetModel.IsA('Model') &&
        TargetModel !== this.instance &&
        TargetModel.Name !== this.instance.Name &&
        TargetModel.FindFirstChild('HumanoidRootPart') &&
        TargetModel.FindFirstChild('Head')
      ) {
        const TargetPart = TargetModel.FindFirstChild('HumanoidRootPart') as
          | BasePart
          | undefined
        let FoundHumanoid: Humanoid | undefined
        for (const Child of TargetModel.GetChildren()) {
          if (Child && Child.IsA('Humanoid') && Child.Health !== 0) {
            FoundHumanoid = Child
          }
        }
        if (
          TargetModel &&
          TargetPart &&
          FoundHumanoid &&
          FoundHumanoid.Health !== 0 &&
          TargetPart.Position.sub(this.humanoidRootPart.Position).Magnitude <
            NoticeDistance
        ) {
          TargetMain = TargetPart
          NoticeDistance = TargetPart.Position.sub(
            this.humanoidRootPart.Position,
          ).Magnitude
          const [hit, _pos] = this.raycast(
            this.humanoidRootPart.Position,
            TargetPart.Position.sub(this.humanoidRootPart.Position).Unit,
            500,
          )
          if (
            hit &&
            hit.Parent &&
            hit.Parent.IsA('Model') &&
            hit.Parent.FindFirstChild('HumanoidRootPart') &&
            hit.Parent.FindFirstChild('Head')
          ) {
            if (
              TargetModel &&
              TargetPart &&
              FoundHumanoid &&
              FoundHumanoid.Health !== 0 &&
              TargetPart.Position.sub(this.humanoidRootPart.Position)
                .Magnitude < 9 &&
              !this.attackDebounce
            ) {
              spawn(() => {
                this.attackDebounce = true
                const swing = this.instance.FindFirstChild('Swing')
                const SwingAnimation =
                  swing && swing.IsA('Animation')
                    ? this.humanoid?.LoadAnimation(swing)
                    : undefined
                SwingAnimation?.Play()
                SwingAnimation?.AdjustSpeed(1.5 + math.random() * 0.1)
                wait(0.3)
                if (
                  TargetModel &&
                  TargetPart &&
                  FoundHumanoid &&
                  FoundHumanoid.Health !== 0 &&
                  this.humanoidRootPart &&
                  TargetPart.Position.sub(this.humanoidRootPart.Position)
                    .Magnitude < 5
                ) {
                  FoundHumanoid.TakeDamage(math.huge)
                }
                wait(0.1)
                this.attackDebounce = false
              })
            }
          }
        }
      }
    }
    return TargetMain
  }

  mainLoop() {
    if (!this.humanoid || !this.humanoidRootPart) return
    while (wait(0)[0]) {
      const TargetPoint = this.humanoid.TargetPoint
      const [Blockage, BlockagePos] = this.RayCast(
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
        this.humanoidRootPart.CFrame.LookVector,
        this.humanoidRootPart.Size.Z * 2.5,
        [this.instance, this.instance],
      )
      let Jumpable = false
      if (Blockage) {
        Jumpable = true
        if (
          Blockage &&
          Blockage.Parent &&
          Blockage.Parent.ClassName !== 'Workspace'
        ) {
          let BlockageHumanoid
          for (const Child of Blockage.Parent.GetChildren()) {
            if (Child && Child.IsA('Humanoid') && Child.Health !== 0) {
              BlockageHumanoid = Child
            }
          }
          if (Blockage && Blockage.IsA('Terrain')) {
            const CellPos = Blockage.WorldToCellPreferSolid(
              BlockagePos.sub(new Vector3(0, 2, 0)),
            )
            const [CellMaterial] = <[Enum.CellMaterial]>(
              Blockage.GetCell(CellPos.X, CellPos.Y, CellPos.Z)
            )
            if (CellMaterial === Enum.CellMaterial.Water) {
              Jumpable = false
            }
          } else if (
            BlockageHumanoid ||
            Blockage.ClassName === 'TrussPart' ||
            Blockage.ClassName === 'WedgePart' ||
            (Blockage.Name === 'Handle' &&
              Blockage.Parent.ClassName === 'Hat') ||
            (Blockage.Name === 'Handle' && Blockage.Parent.ClassName === 'Tool')
          ) {
            Jumpable = false
          }
        }
        if (
          this.instance &&
          this.humanoid &&
          this.humanoid.Health !== 0 &&
          !this.humanoid.Sit &&
          Jumpable
        ) {
          this.humanoid.Jump = true
        }
      }

      const MainTarget = this.findNearestBae()
      let FoundHumanoid
      if (MainTarget && MainTarget.Parent) {
        for (const Child of MainTarget.Parent.GetChildren()) {
          if (Child && Child.IsA('Humanoid') && Child.Health !== 0) {
            FoundHumanoid = Child
          }
        }
      }

      if (
        this.instance &&
        this.humanoid &&
        this.humanoid.Health !== 0 &&
        MainTarget &&
        MainTarget.Parent &&
        FoundHumanoid &&
        FoundHumanoid.Jump
      ) {
        this.humanoid.Jump = true
      }

      if (MainTarget) {
        this.notice = true
        if (this.instance && this.humanoid && this.humanoid.Health !== 0) {
          if (
            MainTarget &&
            FoundHumanoid &&
            FoundHumanoid.Health !== 0 &&
            MainTarget.Position.sub(this.humanoidRootPart.Position).Magnitude >
              5
          ) {
            wait(2)
            this.humanoid.WalkSpeed = 30
          } else if (
            MainTarget &&
            FoundHumanoid &&
            FoundHumanoid.Health !== 0 &&
            MainTarget.Position.sub(this.humanoidRootPart.Position).Magnitude <
              5
          ) {
            this.humanoid.WalkSpeed = 16
          }
          this.humanoid.MoveTo(
            MainTarget.Position.add(
              MainTarget.Position.sub(this.humanoidRootPart.Position).Unit.mul(
                2,
              ),
            ),
            game.Workspace.FindFirstChild('Terrain') as Terrain | undefined,
          )
        }
      } else {
        this.notice = false
        this.noticeDebounce = false
        const RandomWalk = math.random(1, 150)
        if (this.instance && this.humanoid && this.humanoid.Health !== 0) {
          const terrain = game.Workspace.FindFirstChild('Terrain') as
            | Terrain
            | undefined
          this.humanoid.WalkSpeed = 16
          if (terrain && RandomWalk === 1) {
            this.humanoid.MoveTo(
              terrain.Position.add(
                new Vector3(
                  math.random(-2048, 2048),
                  0,
                  math.random(-2048, 2048),
                ),
              ),
              terrain,
            )
          }
        }
      }

      if (this.instance && this.humanoid) {
        this.humanoid.DisplayDistanceType =
          Enum.HumanoidDisplayDistanceType.None
        this.humanoid.HealthDisplayDistance = 0
        this.humanoid.Name = 'Humanoid'
        this.humanoid.NameDisplayDistance = 0
        this.humanoid.NameOcclusion = Enum.NameOcclusion.EnemyOcclusion
        this.humanoid.AutoJumpEnabled = true
        this.humanoid.AutoRotate = true
        this.humanoid.MaxHealth = math.huge
        this.humanoid.JumpPower = 67
        this.humanoid.MaxSlopeAngle = 89.9
      }
      if (this.instance && this.humanoid && !this.humanoid.AutoJumpEnabled) {
        this.humanoid.AutoJumpEnabled = true
      }
      if (this.instance && this.humanoid && !this.humanoid.AutoRotate) {
        this.humanoid.AutoRotate = true
      }
      if (this.instance && this.humanoid && this.humanoid.PlatformStand) {
        this.humanoid.PlatformStand = false
      }
      if (this.instance && this.humanoid && this.humanoid.Sit) {
        this.humanoid.Sit = false
      }
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
    //respawndant.FindFirstChild('Head')?.MakeJoints()
    //respawndant.FindFirstChild('Torso')?.MakeJoints()
    respawndant.Parent = this.instance.Parent
  }

  onStart() {
    this.respawndant = this.instance.Clone()
    this.knife = this.instance.FindFirstChild('Knife') as BasePart | undefined
    this.head = this.instance.FindFirstChild('Head') as BasePart | undefined
    this.humanoidRootPart = this.instance.FindFirstChild('HumanoidRootPart') as
      | BasePart
      | undefined
    for (const child of this.instance.GetChildren()) {
      if (child?.IsA('Humanoid') && child.Health !== 0) {
        this.humanoid = child
      }
    }
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
        //this.instance.remove()
      })
    }
    this.mainLoop()
  }
}
