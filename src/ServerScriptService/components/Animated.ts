import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import Object from '@rbxts/object-utils'
import { AnimatedTag } from 'ReplicatedStorage/shared/constants/tags'
import { findFirstChildWhichIs } from 'ReplicatedStorage/shared/utils/instance'

export interface AnimatedCharacter extends Model {
  Humanoid: Humanoid
  Torso: BasePart & {
    'Left Hip': Motor6D
    'Left Shoulder': Motor6D
    Neck: Motor6D
    'Right Hip': Motor6D
    'Right Shoulder': Motor6D
  }
}

export interface WeightedAnimationID {
  id: string
  weight: number
}

export interface WeightedAnimation {
  anim: Animation
  weight: number
}

export interface WeightedAnimations {
  animations: WeightedAnimation[]
  connections: RBXScriptConnection[]
  totalWeight: number
}

@Component({ tag: AnimatedTag })
export class AnimatedComponent
  extends BaseComponent<{}, AnimatedCharacter>
  implements OnStart
{
  animationsFolder = 'Animations' // Parent children of replaced Animate script here
  animNames: Record<string, WeightedAnimationID[]> = {
    idle: [
      { id: 'http://www.roblox.com/asset/?id=180435571', weight: 9 },
      { id: 'http://www.roblox.com/asset/?id=180435792', weight: 1 },
    ],
    walk: [{ id: 'http://www.roblox.com/asset/?id=180426354', weight: 10 }],
    run: [{ id: 'http://www.roblox.com/asset/?id=252557606', weight: 20 }],
    jump: [{ id: 'http://www.roblox.com/asset/?id=125750702', weight: 10 }],
    fall: [{ id: 'http://www.roblox.com/asset/?id=180436148', weight: 10 }],
    climb: [{ id: 'http://www.roblox.com/asset/?id=180436334', weight: 10 }],
    sit: [{ id: 'http://www.roblox.com/asset/?id=178130996', weight: 10 }],
    toolnone: [{ id: 'http://www.roblox.com/asset/?id=182393478', weight: 10 }],
    toolslash: [
      { id: 'http://www.roblox.com/asset/?id=129967390', weight: 10 },
    ],
    toollunge: [
      { id: 'http://www.roblox.com/asset/?id=129967478', weight: 10 },
    ],
    wave: [{ id: 'http://www.roblox.com/asset/?id=128777973', weight: 10 }],
    point: [{ id: 'http://www.roblox.com/asset/?id=128853357', weight: 10 }],
    dance1: [
      { id: 'http://www.roblox.com/asset/?id=182435998', weight: 10 },
      { id: 'http://www.roblox.com/asset/?id=182491037', weight: 10 },
      { id: 'http://www.roblox.com/asset/?id=182491065', weight: 10 },
    ],
    dance2: [
      { id: 'http://www.roblox.com/asset/?id=182436842', weight: 10 },
      { id: 'http://www.roblox.com/asset/?id=182491248', weight: 10 },
      { id: 'http://www.roblox.com/asset/?id=182491277', weight: 10 },
    ],
    dance3: [
      { id: 'http://www.roblox.com/asset/?id=182436935', weight: 10 },
      { id: 'http://www.roblox.com/asset/?id=182491368', weight: 10 },
      { id: 'http://www.roblox.com/asset/?id=182491423', weight: 10 },
    ],
    laugh: [{ id: 'http://www.roblox.com/asset/?id=129423131', weight: 10 }],
    cheer: [{ id: 'http://www.roblox.com/asset/?id=129423030', weight: 10 }],
  }
  animTable: Record<string, WeightedAnimations> = {}
  currentAnim = ''
  currentAnimInstance?: Animation
  currentAnimKeyframeHandler?: RBXScriptConnection
  currentAnimSpeed = 1.0
  currentAnimTrack?: AnimationTrack
  currentToolAnimKeyframeHandler?: RBXScriptConnection
  dances = ['dance1', 'dance2', 'dance3']
  emoteNames: Record<string, boolean> = {
    wave: false,
    point: false,
    dance1: true,
    dance2: true,
    dance3: true,
    laugh: false,
    cheer: false,
  }
  emoteTransitionTime = 0.1
  fallTransitionTime = 0.3
  humanoid!: Humanoid
  jumpAnimTime = 0
  jumpAnimDuration = 0.3
  jumpMaxLimbVelocity = 0.75
  lastTick = 0
  leftHip!: Motor6D
  leftShoulder!: Motor6D
  neck!: Motor6D
  pose = 'Standing'
  rightHip!: Motor6D
  rightShoulder!: Motor6D
  toolAnim = 'None'
  toolAnimInstance?: Animation
  toolAnimName = ''
  toolAnimTime = 0
  toolAnimTrack?: AnimationTrack
  toolTransitionTime = 0.1
  torso!: BasePart

  onStart() {
    this.torso = this.instance.Torso
    this.rightShoulder = this.instance.Torso['Right Shoulder']
    this.leftShoulder = this.instance.Torso['Left Shoulder']
    this.rightHip = this.instance.Torso['Right Hip']
    this.leftHip = this.instance.Torso['Left Hip']
    this.neck = this.instance.Torso.Neck
    this.humanoid = this.instance.Humanoid

    // Clear any existing animation tracks
    // Fixes issue with characters that are moved in and out of the Workspace accumulating tracks
    const animator = this.humanoid.FindFirstChildOfClass('Animator')
    if (animator) {
      const animTracks = animator.GetPlayingAnimationTracks()
      for (const track of animTracks) {
        track.Stop(0)
        track.Destroy()
      }
    }

    // Setup animation objects
    const animations = this.instance.FindFirstChild<Folder>(
      this.animationsFolder,
    )
    if (animations) {
      const scriptChildModified = (child: Instance) => {
        const fileList = this.animNames[child.Name]
        if (fileList) this.configureAnimationSet(child.Name, fileList)
      }
      script.ChildAdded.Connect(scriptChildModified)
      script.ChildRemoved.Connect(scriptChildModified)
    }
    for (const [name, fileList] of Object.entries(this.animNames)) {
      this.configureAnimationSet(name, fileList)
    }

    // connect events
    this.humanoid.Died.Connect(() => this.onDied())
    this.humanoid.Running.Connect((speed) => this.onRunning(speed))
    this.humanoid.Jumping.Connect(() => this.onJumping())
    this.humanoid.Climbing.Connect((speed) => this.onClimbing(speed))
    this.humanoid.GettingUp.Connect(() => this.onGettingUp())
    this.humanoid.FreeFalling.Connect(() => this.onFreeFall())
    this.humanoid.FallingDown.Connect(() => this.onFallingDown())
    this.humanoid.Seated.Connect(() => this.onSeated())
    this.humanoid.PlatformStanding.Connect(() => this.onPlatformStanding())
    this.humanoid.Swimming.Connect((speed) => this.onSwimming(speed))

    // initialize to idle
    this.playAnimation('idle', 0.1, this.humanoid)

    Promise.try(() => {
      while (this.instance.Parent && this.humanoid?.Health) {
        const [_, time] = wait(0)
        this.move(time)
      }
    })
  }

  onRunning(speed: number) {
    if (speed > 0.01) {
      if (this.humanoid.WalkSpeed < 17) {
        this.playAnimation('walk', 0.1, this.humanoid)
      } else if (this.humanoid.WalkSpeed > 17) {
        this.playAnimation('run', 0.1, this.humanoid)
      }
      if (
        this.currentAnimInstance &&
        this.currentAnimInstance.AnimationId === this.animNames['walk'][0].id
      ) {
        this.setAnimationSpeed(speed / 14.5)
      }
      this.pose = 'Running'
    } else {
      if (this.emoteNames[this.currentAnim] === undefined) {
        this.playAnimation('idle', 0.1, this.humanoid)
        this.pose = 'Standing'
      }
    }
  }

  onDied() {
    this.pose = 'Dead'
  }

  onJumping() {
    this.playAnimation('jump', 0.1, this.humanoid)
    this.jumpAnimTime = this.jumpAnimDuration
    this.pose = 'Jumping'
  }

  onClimbing(speed: number) {
    this.playAnimation('climb', 0.1, this.humanoid)
    this.setAnimationSpeed(speed / 12.0)
    this.pose = 'Climbing'
  }

  onGettingUp() {
    this.pose = 'GettingUp'
  }

  onFreeFall() {
    if (this.jumpAnimTime <= 0) {
      this.playAnimation('fall', this.fallTransitionTime, this.humanoid)
    }
    this.pose = 'FreeFall'
  }

  onFallingDown() {
    this.pose = 'FallingDown'
  }

  onSeated() {
    this.pose = 'Seated'
  }

  onPlatformStanding() {
    this.pose = 'PlatformStanding'
  }

  onSwimming(speed: number) {
    if (speed > 0) {
      this.pose = 'Running'
    } else {
      this.pose = 'Standing'
    }
  }

  configureAnimationSet(name: string, fileList: WeightedAnimationID[]) {
    const entry: WeightedAnimations = {
      animations: [],
      connections: [],
      totalWeight: 0,
    }

    if (this.animTable[name]) {
      for (const connection of this.animTable[name].connections)
        connection.Disconnect()
    }

    // check for config values
    const animationsFolder = this.instance.FindFirstChild('Animations')
    const config = animationsFolder?.FindFirstChild(name)
    if (config) {
      // print(`Loading anims ${name}`)
      entry.connections.push(
        config.ChildAdded.Connect((_child) =>
          this.configureAnimationSet(name, fileList),
        ),
      )
      entry.connections.push(
        config.ChildRemoved.Connect((_child) =>
          this.configureAnimationSet(name, fileList),
        ),
      )
      for (const child of config.GetChildren()) {
        if (!child.IsA('Animation')) continue
        entry.connections.push(
          child
            .GetPropertyChangedSignal('AnimationId')
            .Connect(() => this.configureAnimationSet(name, fileList)),
        )
        const weightObject = child.FindFirstChild<IntValue>('Weight')
        const animation = {
          anim: child,
          weight: weightObject?.Value ?? 1,
        }
        entry.totalWeight += animation.weight
        entry.animations.push(animation)
        // print(`${name} [${entry.animations.size()-1}] ${animation.anim.AnimationId} (${animation.weight})`)
      }
    }

    // fallback to defaults
    if (entry.animations.size() <= 0) {
      for (const anim of fileList) {
        const animation: WeightedAnimation = {
          anim: new Instance('Animation'),
          weight: anim.weight,
        }
        animation.anim.Name = name
        animation.anim.AnimationId = anim.id
        entry.animations.push(animation)
        entry.totalWeight += anim.weight
        // print(`${name} [${entry.animations.size()-1}] ${animation.anim.AnimationId} (${animation.weight})`)
      }
    }
    this.animTable[name] = entry
  }

  stopAllAnimations() {
    let oldAnim = this.currentAnim
    // return to idle if finishing an emote
    if (this.emoteNames[oldAnim] === false) oldAnim = 'idle'
    this.currentAnim = ''
    this.currentAnimInstance = undefined
    if (this.currentAnimKeyframeHandler)
      this.currentAnimKeyframeHandler.Disconnect()
    if (this.currentAnimTrack) {
      this.currentAnimTrack.Stop()
      this.currentAnimTrack.Destroy()
      this.currentAnimTrack = undefined
    }
    return oldAnim
  }

  setAnimationSpeed(speed: number) {
    if (speed !== this.currentAnimSpeed) {
      this.currentAnimSpeed = speed
      this.currentAnimTrack?.AdjustSpeed(this.currentAnimSpeed)
    }
  }

  playAnimation(animName: string, transitionTime: number, humanoid: Humanoid) {
    let roll = math.random(1, this.animTable[animName].totalWeight)
    let idx = 0
    while (roll > this.animTable[animName].animations[idx].weight) {
      roll = roll - this.animTable[animName].animations[idx].weight
      idx = idx + 1
    }
    const anim = this.animTable[animName].animations[idx].anim

    // switch animation
    if (anim !== this.currentAnimInstance) {
      if (this.currentAnimTrack) {
        this.currentAnimTrack.Stop(transitionTime)
        this.currentAnimTrack.Destroy()
      }
      this.currentAnimSpeed = 1.0

      // load it to the humanoid; get AnimationTrack
      this.currentAnimTrack = humanoid.LoadAnimation(anim)
      this.currentAnimTrack.Priority = Enum.AnimationPriority.Core

      // play the animation
      this.currentAnimTrack.Play(transitionTime)
      this.currentAnim = animName
      this.currentAnimInstance = anim

      // set up keyframe name triggers
      if (this.currentAnimKeyframeHandler)
        this.currentAnimKeyframeHandler.Disconnect()
      this.currentAnimKeyframeHandler =
        this.currentAnimTrack.KeyframeReached.Connect((frameName) => {
          if (frameName === 'End') {
            let repeatAnim = this.currentAnim
            // return to idle if finishing an emote
            if (this.emoteNames[repeatAnim] === false) repeatAnim = 'idle'
            const animSpeed = this.currentAnimSpeed
            this.playAnimation(repeatAnim, 0.0, humanoid)
            this.setAnimationSpeed(animSpeed)
          }
        })
    }
  }

  playToolAnimation(
    animName: string,
    transitionTime: number,
    humanoid: Humanoid,
    priority?: Enum.AnimationPriority,
  ) {
    let roll = math.random(1, this.animTable[animName].totalWeight)
    let idx = 0
    while (roll > this.animTable[animName].animations[idx].weight) {
      roll = roll - this.animTable[animName].animations[idx].weight
      idx = idx + 1
    }
    const anim = this.animTable[animName].animations[idx].anim

    if (this.toolAnimInstance !== anim) {
      if (this.toolAnimTrack) {
        this.toolAnimTrack.Stop()
        this.toolAnimTrack.Destroy()
        transitionTime = 0
      }

      // load it to the humanoid; get AnimationTrack
      this.toolAnimTrack = humanoid.LoadAnimation(anim)
      if (priority !== undefined) this.toolAnimTrack.Priority = priority

      // play the animation
      this.toolAnimTrack.Play(transitionTime)
      this.toolAnimName = animName
      this.toolAnimInstance = anim
      this.currentToolAnimKeyframeHandler =
        this.toolAnimTrack.KeyframeReached.Connect((frameName) => {
          if (frameName === 'End')
            this.playToolAnimation(this.toolAnimName, 0.0, humanoid)
        })
    }
  }

  stopToolAnimations() {
    const oldAnim = this.toolAnimName
    if (this.currentToolAnimKeyframeHandler) {
      this.currentToolAnimKeyframeHandler.Disconnect()
    }
    this.toolAnimName = ''
    this.toolAnimInstance = undefined
    if (this.toolAnimTrack) {
      this.toolAnimTrack.Stop()
      this.toolAnimTrack.Destroy()
      this.toolAnimTrack = undefined
    }
    return oldAnim
  }

  animateTool() {
    if (!this.humanoid) return
    if (this.toolAnim === 'None') {
      this.playToolAnimation(
        'toolnone',
        this.toolTransitionTime,
        this.humanoid,
        Enum.AnimationPriority.Idle,
      )
      return
    }
    if (this.toolAnim === 'Slash') {
      this.playToolAnimation(
        'toolslash',
        0,
        this.humanoid,
        Enum.AnimationPriority.Action,
      )
      return
    }
    if (this.toolAnim === 'Lunge') {
      this.playToolAnimation(
        'toollunge',
        0,
        this.humanoid,
        Enum.AnimationPriority.Action,
      )
      return
    }
  }

  moveSit() {
    this.leftShoulder.MaxVelocity = 0.15
    this.leftShoulder.SetDesiredAngle(-3.14 / 2)
    this.rightShoulder.MaxVelocity = 0.15
    this.rightShoulder.SetDesiredAngle(3.14 / 2)
    this.leftHip.SetDesiredAngle(-3.14 / 2)
    this.rightHip.SetDesiredAngle(3.14 / 2)
  }

  move(time: number) {
    const deltaTime = time - this.lastTick
    this.lastTick = time

    const climbFudge = 0
    let setAngles = false
    let amplitude = 1
    let frequency = 1

    if (this.jumpAnimTime > 0) this.jumpAnimTime = this.jumpAnimTime - deltaTime

    if (this.pose === 'FreeFall' && this.jumpAnimTime <= 0) {
      this.playAnimation('fall', this.fallTransitionTime, this.humanoid)
    } else if (this.pose === 'Seated') {
      this.playAnimation('sit', 0.5, this.humanoid)
      return
    } else if (this.pose === 'Running') {
      if (this.humanoid.WalkSpeed < 17) {
        this.playAnimation('walk', 0.1, this.humanoid)
      } else if (this.humanoid.WalkSpeed > 17) {
        this.playAnimation('run', 0.1, this.humanoid)
      }
    } else if (
      this.pose === 'Dead' ||
      this.pose === 'GettingUp' ||
      this.pose === 'FallingDown' ||
      this.pose === 'Seated' ||
      this.pose === 'PlatformStanding'
    ) {
      this.stopAllAnimations()
      amplitude = 0.1
      frequency = 1
      setAngles = true
    }
    if (setAngles) {
      const desiredAngle = amplitude * math.sin(time * frequency)
      this.rightShoulder.SetDesiredAngle(desiredAngle + climbFudge)
      this.leftShoulder.SetDesiredAngle(desiredAngle - climbFudge)
      this.rightHip.SetDesiredAngle(-desiredAngle)
      this.leftHip.SetDesiredAngle(-desiredAngle)
    }

    // Tool Animation handling
    const tool = this.instance.FindFirstChildOfClass('Tool')
    if (tool && tool.FindFirstChild('Handle')) {
      const animStringValueObject = findFirstChildWhichIs<StringValue>(
        tool,
        'toolanim',
        'StringValue',
      )
      if (animStringValueObject) {
        this.toolAnim = animStringValueObject.Value
        // message recieved, delete StringValue
        animStringValueObject.Parent = undefined
        this.toolAnimTime = time + 0.3
      }
      if (time > this.toolAnimTime) {
        this.toolAnimTime = 0
        this.toolAnim = 'None'
      }
      this.animateTool()
    } else {
      this.stopToolAnimations()
      this.toolAnim = 'None'
      this.toolAnimInstance = undefined
      this.toolAnimTime = 0
    }
  }
}
