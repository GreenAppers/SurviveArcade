import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import RaycastHitbox, { HitboxObject } from '@rbxts/raycast-hitbox'
import { Debris, Players, RunService } from '@rbxts/services'
import { SwordTag } from 'ReplicatedStorage/shared/constants/tags'

function isTeamMate(player1: Player, player2: Player) {
  return (
    player1 &&
    player2 &&
    !player1.Neutral &&
    !player2.Neutral &&
    player1.TeamColor === player2.TeamColor
  )
}

function tagHumanoid(humanoid: Humanoid, player: Player) {
  const creator = new Instance('ObjectValue')
  creator.Name = 'creator'
  creator.Value = player
  Debris.AddItem(creator, 2)
  creator.Parent = humanoid
}

function untagHumanoid(humanoid: Humanoid) {
  for (const v of humanoid.GetChildren()) {
    if (v.IsA('ObjectValue') && v.Name === 'creator') v.Destroy()
  }
}

function createAnimation(name: string, id: number, parent: Instance) {
  const anim = new Instance('Animation')
  anim.Name = name
  anim.AnimationId = `rbxassetid://${id}`
  anim.Parent = parent
  return anim
}

@Component({ tag: SwordTag })
export class SwordComponent
  extends BaseComponent<{}, Sword>
  implements OnStart
{
  damageValues = {
    baseDamage: 5,
    slashDamage: 10,
    lungeDamage: 30,
  }

  // For R15 avatars
  animations = {
    r15Slash: 522635514,
    r15Lunge: 522638767,
  }

  grips = {
    up: new CFrame(0, 0, -1.70000005, 0, 0, 1, 1, 0, 0, 0, 1, 0),
    out: new CFrame(0, 0, -1.70000005, 0, 1, 0, 1, -0, 0, 0, 0, -1),
  }

  character: PlayerCharacter | undefined
  player: Player | undefined
  humanoid: Humanoid | undefined
  torso: BasePart | undefined
  hitbox: HitboxObject | undefined
  slashSound: Sound | undefined
  lungeSound: Sound | undefined
  unsheathSound: Sound | undefined
  slashAnim: Animation | undefined
  lungeAnim: Animation | undefined
  damage = 0
  lastAttack = 0
  toolEquipped = false

  onStart() {
    const tool = this.instance
    const handle = tool.Handle

    this.damage = this.damageValues.baseDamage
    this.character = tool.Parent as PlayerCharacter | undefined
    this.slashSound = handle.WaitForChild<Sound>('SwordSlash')
    this.lungeSound = handle.WaitForChild<Sound>('SwordLunge')
    this.unsheathSound = handle.WaitForChild<Sound>('Unsheath')

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

  handleActivated() {
    if (!this.instance.Enabled || !this.toolEquipped || !this.isAlive()) return
    this.instance.Enabled = false
    this.hitbox?.HitStart()
    const [tick] = RunService.Stepped.Wait()
    if (tick - this.lastAttack < 0.35) {
      this.lunge()
    } else {
      this.attack()
    }
    this.lastAttack = tick
    // wait(0.5)
    this.damage = this.damageValues.baseDamage
    this.slashAnim =
      this.instance.FindFirstChild<Animation>('R15Slash') ||
      createAnimation('R15Slash', this.animations.r15Slash, this.instance)
    this.lungeAnim =
      this.instance.FindFirstChild<Animation>('R15Lunge') ||
      createAnimation('R15Lunge', this.animations.r15Lunge, this.instance)
    this.instance.Enabled = true
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
    this.toolEquipped = true

    this.hitbox = new RaycastHitbox(this.instance)
    this.hitbox.DetectionMode = RaycastHitbox.DetectionMode.PartMode
    this.hitbox.Visualizer = true
    this.hitbox.OnHit.Connect((hit) => this.handleStruck(hit))
    this.unsheathSound?.Play()
  }

  handleUnequipped() {
    this.hitbox?.Destroy()
    this.instance.Grip = this.grips.up
    this.toolEquipped = false
  }

  handleStruck(hit: Instance) {
    if (
      !hit ||
      !hit.Parent ||
      !this.player ||
      !this.toolEquipped ||
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
    untagHumanoid(humanoid)
    tagHumanoid(humanoid, this.player)
    humanoid.TakeDamage(this.damageValues.baseDamage)
  }

  attack() {
    this.damage = this.damageValues.slashDamage
    this.slashSound?.Play()
    if (this.humanoid) {
      if (this.humanoid.RigType === Enum.HumanoidRigType.R6) {
        const anim = new Instance('StringValue')
        anim.Name = 'toolanim'
        anim.Value = 'Slash'
        anim.Parent = this.instance
      } else if (this.humanoid.RigType === Enum.HumanoidRigType.R15) {
        const anim = this.instance.FindFirstChild<Animation>('R15Slash')
        if (anim) {
          const track = this.humanoid.LoadAnimation(anim)
          track.Play(0)
        }
      }
    }
    wait(0.2)
    this.hitbox?.HitStop()
  }

  lunge() {
    this.damage = this.damageValues.lungeDamage
    this.lungeSound?.Play()
    if (this.humanoid) {
      if (this.humanoid.RigType === Enum.HumanoidRigType.R6) {
        const anim = new Instance('StringValue')
        anim.Name = 'toolanim'
        anim.Value = 'Lunge'
        anim.Parent = this.instance
      } else if (this.humanoid.RigType === Enum.HumanoidRigType.R15) {
        const anim = this.instance.FindFirstChild<Animation>('R15Lunge')
        if (anim) {
          const track = this.humanoid.LoadAnimation(anim)
          track.Play(0)
        }
      }
    }
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
    this.hitbox?.HitStop()
    this.damage = this.damageValues.slashDamage
  }
}
