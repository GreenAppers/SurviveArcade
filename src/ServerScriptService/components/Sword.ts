import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { Logger } from '@rbxts/log'
import Object from '@rbxts/object-utils'
import RaycastHitbox, { HitboxObject } from '@rbxts/raycast-hitbox'
import { Players } from '@rbxts/services'
import { SwordTag } from 'ReplicatedStorage/shared/constants/tags'
import { createAnimation } from 'ReplicatedStorage/shared/utils/instance'
import { isTeamMate } from 'ReplicatedStorage/shared/utils/player'
import { takeDamage } from 'ServerScriptService/utils/player'

export interface SwordSwing {
  baseDamage: number
  name: string
  r15animation?: Animation
  r15animationId: number
  r6animation?: Animation
  r6animationId?: number
  r6toolanim?: string
  soundName?: string
  sound?: Sound
}

@Component({ tag: SwordTag })
export class SwordComponent
  extends BaseComponent<{}, Sword>
  implements OnStart
{
  grips = {
    up: new CFrame(new Vector3(0, 0, 0), new Vector3(0, 1, 0)),
    out: new CFrame(new Vector3(0, 0, 0), new Vector3(1, 0, 0)),
  }

  swings: Record<string, SwordSwing> = {
    Slash: {
      baseDamage: 85,
      name: 'Slash',
      r15animationId: 522635514,
      r6toolanim: 'Slash',
      soundName: 'SwordSlash',
    },
    Left: {
      baseDamage: 97,
      name: 'Left',
      r15animationId: 17734827634,
      soundName: 'SwordSlash',
    },
    Lunge: {
      baseDamage: 105,
      name: 'Lunge',
      r15animationId: 522638767,
      r6toolanim: 'Lunge',
      soundName: 'SwordSlash',
    },
    Right: {
      baseDamage: 90,
      name: 'Right',
      r15animationId: 17734841566,
      soundName: 'SwordLunge',
    },
  }

  character: PlayerCharacter | undefined
  player: Player | undefined
  humanoid: Humanoid | undefined
  torso: BasePart | undefined
  hitbox: HitboxObject | undefined
  sheathSound: Sound | undefined
  unsheathSound: Sound | undefined
  active: SwordSwing | undefined
  equipped = false

  constructor(private readonly logger: Logger) {
    super()
  }

  onStart() {
    const tool = this.instance
    const handle = tool.Handle

    this.character = tool.Parent as PlayerCharacter | undefined
    this.sheathSound = handle.WaitForChild<Sound>('Sheath')
    this.unsheathSound = handle.WaitForChild<Sound>('Unsheath')

    for (const swing of Object.values(this.swings)) {
      if (swing.r15animationId) {
        const swingName = `R15${swing.name}`
        swing.r15animation =
          this.instance.FindFirstChild<Animation>(swingName) ||
          createAnimation(swingName, swing.r15animationId, this.instance)
      }
      if (swing.r6animationId) {
        const swingName = `R6${swing.name}`
        swing.r6animation =
          this.instance.FindFirstChild<Animation>(swingName) ||
          createAnimation(swingName, swing.r6animationId, this.instance)
      }
      if (swing.soundName) {
        swing.sound = handle.WaitForChild<Sound>(swing.soundName)
      }
    }

    tool.Enabled = true
    tool.Grip = this.grips.up
    tool.Activated.Connect(() => this.handleActivated())
    tool.Equipped.Connect(() => this.handleEquipped())
    tool.Unequipped.Connect(() => this.handleUnequipped())
  }

  isAlive() {
    return (
      (this.player &&
        this.player.Parent &&
        this.character &&
        this.character.Parent &&
        this.humanoid &&
        this.humanoid.Parent &&
        this.humanoid.Health > 0 &&
        this.torso &&
        this.torso.Parent &&
        true) ||
      false
    )
  }

  handleEquipped() {
    this.character = this.instance.Parent as PlayerCharacter | undefined
    if (!this.character) return

    this.player = Players.GetPlayerFromCharacter(this.character)
    this.humanoid = this.character.FindFirstChildOfClass('Humanoid')
    this.torso =
      this.character.FindFirstChild<BasePart>('Torso') ||
      this.character.FindFirstChild<BasePart>('HumanoidRootPart')
    if (!this.isAlive()) return

    this.equipped = true
    this.hitbox = new RaycastHitbox(this.instance)
    this.hitbox.DetectionMode = RaycastHitbox.DetectionMode.PartMode
    this.hitbox.Visualizer = true
    this.hitbox.OnHit.Connect((hit) => this.handleStruck(hit))
    this.sheathSound?.Stop()
    this.unsheathSound?.Play()
  }

  handleUnequipped() {
    this.hitbox?.Destroy()
    this.instance.Grip = this.grips.up
    this.equipped = false
    this.unsheathSound?.Stop()
    this.sheathSound?.Play()
    for (const swing of Object.values(this.swings)) swing.sound?.Stop()
  }

  handleActivated() {
    if (
      !this.instance.Enabled ||
      !this.equipped ||
      !this.humanoid ||
      !this.torso ||
      !this.isAlive()
    )
      return

    this.instance.Enabled = false
    this.hitbox?.HitStart()

    const forward = this.humanoid.MoveDirection.Dot(
      this.torso.CFrame.LookVector,
    )
    const right = this.humanoid.MoveDirection.Dot(this.torso.CFrame.RightVector)
    if (right > 0.5) {
      this.swing(this.swings.Right)
    } else if (right < -0.5) {
      this.swing(this.swings.Left)
    } else if (forward > 0.5) {
      this.lunge()
    } else {
      this.slash()
    }

    this.hitbox?.HitStop()
    this.active = undefined
    // wait(0.5)
    this.instance.Enabled = true
  }

  handleStruck(hit: Instance) {
    if (
      !hit ||
      !hit.Parent ||
      !this.active ||
      !this.player ||
      !this.equipped ||
      !this.isAlive()
    )
      return
    const rightArm =
      this.character?.FindFirstChild('Right Arm') ||
      this.character?.FindFirstChild('RightHand')
    if (!rightArm) return
    const rightGrip = rightArm.FindFirstChild<Weld>('RightGrip')
    if (
      !rightGrip ||
      (rightGrip.Part0 !== this.instance.Handle &&
        rightGrip.Part1 !== this.instance.Handle)
    )
      return
    const character = hit.Parent
    if (character === this.character) return
    const humanoid = character.FindFirstChildOfClass('Humanoid')
    if (!humanoid || humanoid.Health === 0) return
    const player = Players.GetPlayerFromCharacter(character)
    if (player && (player === this.player || isTeamMate(this.player, player)))
      return

    const damage = this.active.baseDamage
    this.logger.Info(
      `${this.character?.Name} strikes ${hit.Parent?.Name} with ${this.active.name} for ${damage} damage`,
    )
    takeDamage(humanoid, damage, this.player.UserId)
  }

  swing(swing: SwordSwing) {
    this.active = swing
    swing.sound?.Play()

    let animation
    if (this.humanoid?.RigType === Enum.HumanoidRigType.R6) {
      if (swing.r6toolanim) {
        const anim = new Instance('StringValue')
        anim.Name = 'toolanim'
        anim.Value = swing.r6toolanim
        anim.Parent = this.instance
      } else {
        animation = swing.r15animation || swing.r6animation
      }
    } else if (this.humanoid?.RigType === Enum.HumanoidRigType.R15) {
      animation = swing.r15animation || swing.r6animation
    }

    if (animation && this.humanoid) {
      const track = this.humanoid.LoadAnimation(animation)
      track.Play(0)
    }
  }

  slash() {
    if (!this.humanoid || !this.isAlive()) return
    this.swing(this.swings.Slash)
    wait(0.2)
  }

  lunge() {
    if (!this.humanoid || !this.isAlive()) return
    this.swing(this.swings.Lunge)
    /* if (this.isAlive()) {
		  const force = Instance.new("BodyVelocity")
		  force.velocity = Vector3.new(0, 10, 0) 
		  force.maxForce = Vector3.new(0, 4000, 0)
		  Debris.AddItem(force, 0.4)
		  force.Parent = Torso
    } */
    wait(0.2)
    this.instance.Grip = this.grips.out
    wait(0.6)
    this.instance.Grip = this.grips.up
  }
}
