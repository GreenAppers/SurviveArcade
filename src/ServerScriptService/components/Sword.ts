import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import RaycastHitbox, { HitboxObject } from '@rbxts/raycast-hitbox'
import { Debris, Players, RunService } from '@rbxts/services'
import { SwordTag } from 'ReplicatedStorage/shared/constants/tags'

function IsTeamMate(Player1: Player, Player2: Player) {
  return (
    Player1 &&
    Player2 &&
    !Player1.Neutral &&
    !Player2.Neutral &&
    Player1.TeamColor === Player2.TeamColor
  )
}

function TagHumanoid(humanoid: Humanoid, player: Player) {
  const Creator_Tag = new Instance('ObjectValue')
  Creator_Tag.Name = 'creator'
  Creator_Tag.Value = player
  Debris.AddItem(Creator_Tag, 2)
  Creator_Tag.Parent = humanoid
}

function UntagHumanoid(humanoid: Humanoid) {
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
  DamageValues = {
    BaseDamage: 5,
    SlashDamage: 10,
    LungeDamage: 30,
  }

  // For R15 avatars
  Animations = {
    R15Slash: 522635514,
    R15Lunge: 522638767,
  }

  Grips = {
    Up: new CFrame(0, 0, -1.70000005, 0, 0, 1, 1, 0, 0, 0, 1, 0),
    Out: new CFrame(0, 0, -1.70000005, 0, 1, 0, 1, -0, 0, 0, 0, -1),
  }

  SlashAnim: Animation | undefined
  LungeAnim: Animation | undefined

  Character: PlayerCharacter | undefined
  Player: Player | undefined
  Humanoid: Humanoid | undefined
  Torso: BasePart | undefined
  Hitbox: HitboxObject | undefined
  slashSound: Sound | undefined
  lungeSound: Sound | undefined
  unsheathSound: Sound | undefined
  Damage = 0
  LastAttack = 0
  ToolEquipped = false

  onStart() {
    const Tool = this.instance
    const Handle = Tool.Handle

    this.Damage = this.DamageValues.BaseDamage
    this.Character = Tool.Parent as PlayerCharacter | undefined
    this.slashSound = Handle.WaitForChild('SwordSlash') as Sound | undefined
    this.lungeSound = Handle.WaitForChild('SwordLunge') as Sound | undefined
    this.unsheathSound = Handle.WaitForChild('Unsheath') as Sound | undefined

    Tool.Enabled = true
    Tool.Grip = this.Grips.Up
    Tool.Activated.Connect(() => this.Activated())
    Tool.Equipped.Connect(() => this.Equipped())
    Tool.Unequipped.Connect(() => this.Unequipped())
  }

  Blow(Hit: Instance) {
    if (
      !Hit ||
      !Hit.Parent ||
      !this.Player ||
      !this.ToolEquipped ||
      !this.CheckIfAlive()
    )
      return
    const RightArm =
      this.Character?.FindFirstChild('Right Arm') ||
      this.Character?.FindFirstChild('RightHand')
    if (!RightArm) return
    const RightGrip = RightArm.FindFirstChild('RightGrip') as Weld | undefined
    if (
      !RightGrip ||
      (RightGrip.Part0 !== this.instance.Handle &&
        RightGrip.Part1 !== this.instance.Handle)
    )
      return
    const character = Hit.Parent
    if (character === this.Character) return
    const humanoid = character.FindFirstChildOfClass('Humanoid')
    if (!humanoid || humanoid.Health === 0) return
    const player = Players.GetPlayerFromCharacter(character)
    if (player && (player === this.Player || IsTeamMate(this.Player, player)))
      return
    UntagHumanoid(humanoid)
    TagHumanoid(humanoid, this.Player)
    humanoid.TakeDamage(this.DamageValues.BaseDamage)
  }

  Attack() {
    this.Damage = this.DamageValues.SlashDamage
    this.slashSound?.Play()
    if (this.Humanoid) {
      if (this.Humanoid.RigType === Enum.HumanoidRigType.R6) {
        const Anim = new Instance('StringValue')
        Anim.Name = 'toolanim'
        Anim.Value = 'Slash'
        Anim.Parent = this.instance
      } else if (this.Humanoid.RigType === Enum.HumanoidRigType.R15) {
        const Anim = this.instance.FindFirstChild('R15Slash') as
          | Animation
          | undefined
        if (Anim) {
          const Track = this.Humanoid.LoadAnimation(Anim)
          Track.Play(0)
        }
      }
    }
    wait(0.2)
    this.Hitbox?.HitStop()
  }

  Lunge() {
    this.Damage = this.DamageValues.LungeDamage
    this.lungeSound?.Play()
    if (this.Humanoid) {
      if (this.Humanoid.RigType === Enum.HumanoidRigType.R6) {
        const Anim = new Instance('StringValue')
        Anim.Name = 'toolanim'
        Anim.Value = 'Lunge'
        Anim.Parent = this.instance
      } else if (this.Humanoid.RigType === Enum.HumanoidRigType.R15) {
        const Anim = this.instance.FindFirstChild('R15Lunge') as
          | Animation
          | undefined
        if (Anim) {
          const Track = this.Humanoid.LoadAnimation(Anim)
          Track.Play(0)
        }
      }
    }
    /* if (CheckIfAlive()) {
		  const Force = Instance.new("BodyVelocity")
		  Force.velocity = Vector3.new(0, 10, 0) 
		  Force.maxForce = Vector3.new(0, 4000, 0)
		  Debris.AddItem(Force, 0.4)
		  Force.Parent = Torso
    } */
    wait(0.2)
    this.instance.Grip = this.Grips.Out
    wait(0.6)
    this.instance.Grip = this.Grips.Up
    this.Hitbox?.HitStop()
    this.Damage = this.DamageValues.SlashDamage
  }

  Activated() {
    if (!this.instance.Enabled || !this.ToolEquipped || !this.CheckIfAlive())
      return
    this.instance.Enabled = false
    this.Hitbox?.HitStart()
    const [Tick] = RunService.Stepped.Wait()
    if (Tick - this.LastAttack < 0.35) {
      this.Lunge()
    } else {
      this.Attack()
    }
    this.LastAttack = Tick
    // wait(0.5)
    this.Damage = this.DamageValues.BaseDamage
    this.SlashAnim =
      (this.instance.FindFirstChild('R15Slash') as Animation | undefined) ||
      createAnimation('R15Slash', this.Animations.R15Slash, this.instance)
    this.LungeAnim =
      (this.instance.FindFirstChild('R15Lunge') as Animation | undefined) ||
      createAnimation('R15Lunge', this.Animations.R15Lunge, this.instance)
    this.instance.Enabled = true
  }

  CheckIfAlive() {
    return (
      (this.Player &&
        this.Player.Parent &&
        this.Character &&
        this.Character.Parent &&
        this.Humanoid &&
        this.Humanoid.Parent &&
        this.Humanoid.Health > 0 &&
        this.Torso &&
        this.Torso.Parent &&
        true) ||
      false
    )
  }

  Equipped() {
    this.Character = this.instance.Parent as PlayerCharacter | undefined
    if (!this.Character) return

    this.Player = Players.GetPlayerFromCharacter(this.Character)
    this.Humanoid = this.Character.FindFirstChildOfClass('Humanoid')
    this.Torso =
      (this.Character.FindFirstChild('Torso') as BasePart | undefined) ||
      (this.Character.FindFirstChild('HumanoidRootPart') as
        | BasePart
        | undefined)
    if (!this.CheckIfAlive()) return
    this.ToolEquipped = true

    this.Hitbox = new RaycastHitbox(this.instance)
    this.Hitbox.DetectionMode = RaycastHitbox.DetectionMode.PartMode
    this.Hitbox.Visualizer = true
    this.Hitbox.OnHit.Connect((hit) => this.Blow(hit))
    this.unsheathSound?.Play()
  }

  Unequipped() {
    this.Hitbox?.Destroy()
    this.instance.Grip = this.Grips.Up
    this.ToolEquipped = false
  }
}
