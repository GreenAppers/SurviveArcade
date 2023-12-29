import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import Object from '@rbxts/object-utils'
import { AnimatedTag } from 'ReplicatedStorage/shared/constants/tags'

function getTool(instance: Instance) {
  for (const kid of instance.GetChildren()) {
    if (kid.IsA('Tool')) return kid
  }
  return undefined
}

function getToolAnim(tool: Tool) {
  for (const c of tool.GetChildren()) {
    if (c.Name === 'toolanim' && c.IsA('StringValue')) return c
  }
  return undefined
}

function waitForChild(parent: Instance, childName: string) {
  let child = parent.FindFirstChild(childName)
  if (child) return child
  for (;;) {
    child = parent.ChildAdded.Wait()[0]
    if (child.Name === childName) return child
  }
}

interface WeightedAnimationID {
  id: string
  weight: number
}

interface WeightedAnimation {
  anim: Animation
  weight: number
}

interface WeightedAnimations {
  animations: WeightedAnimation[]
  totalWeight: number
}

@Component({ tag: AnimatedTag })
export class AnimatedComponent
  extends BaseComponent<{}, Model>
  implements OnStart
{
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
  }
  animTable: Record<string, WeightedAnimations> = {}
  toolAnim = 'None'
  toolAnimTime = 0
  jumpAnimTime = 0
  jumpAnimDuration = 0.3
  toolTransitionTime = 0.1
  fallTransitionTime = 0.3
  jumpMaxLimbVelocity = 0.75
  humanoid?: Humanoid
  torso?: BasePart
  rightShoulder?: Motor6D
  leftShoulder?: Motor6D
  rightHip?: Motor6D
  leftHip?: Motor6D
  neck?: Motor6D
  pose = 'Standing'
  currentAnim = ''
  currentAnimInstance?: Animation
  currentAnimTrack?: AnimationTrack
  currentAnimKeyframeHandler?: RBXScriptConnection
  currentAnimSpeed = 1.0
  toolAnimName = ''
  toolAnimTrack?: AnimationTrack
  toolAnimInstance?: Animation
  currentToolAnimKeyframeHandler?: RBXScriptConnection
  lastTick = 0

  configureAnimationSet(name: string, fileList: WeightedAnimationID[]) {
    const entry: WeightedAnimations = {
      animations: [],
      totalWeight: 0,
    }
    for (const anim of fileList) {
      const animation: WeightedAnimation = {
        anim: new Instance('Animation'),
        weight: anim.weight,
      }
      animation.anim.Name = name
      animation.anim.AnimationId = anim.id
      entry.animations.push(animation)
      entry.totalWeight += anim.weight
    }
    this.animTable[name] = entry
  }

  stopAllAnimations() {
    const oldAnim = this.currentAnim
    this.currentAnim = ''
    this.currentAnimInstance = undefined
    if (this.currentAnimKeyframeHandler) {
      this.currentAnimKeyframeHandler.Disconnect()
    }
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
    if (anim !== this.currentAnimInstance) {
      if (this.currentAnimTrack) {
        this.currentAnimTrack.Stop(transitionTime)
        this.currentAnimTrack.Destroy()
      }
      this.currentAnimSpeed = 1.0
      // load it to the humanoid; get AnimationTrack
      this.currentAnimTrack = humanoid.LoadAnimation(anim)
      // play the animation
      this.currentAnimTrack.Play(transitionTime)
      this.currentAnim = animName
      this.currentAnimInstance = anim
      // set up keyframe name triggers
      if (this.currentAnimKeyframeHandler) {
        this.currentAnimKeyframeHandler.Disconnect()
      }
      this.currentAnimKeyframeHandler =
        this.currentAnimTrack.KeyframeReached.Connect((frameName) => {
          if (frameName === 'End' && this.humanoid) {
            const repeatAnim = this.currentAnim
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
      // play the animation
      this.toolAnimTrack.Play(transitionTime)
      this.toolAnimName = animName
      this.toolAnimInstance = anim
      this.currentToolAnimKeyframeHandler =
        this.toolAnimTrack.KeyframeReached.Connect((frameName) => {
          if (frameName === 'End') {
            this.playToolAnimation(this.toolAnimName, 0.0, humanoid)
          }
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
      this.playToolAnimation('toolnone', this.toolTransitionTime, this.humanoid)
      return
    }
    if (this.toolAnim === 'Slash') {
      this.playToolAnimation('toolslash', 0, this.humanoid)
      return
    }
    if (this.toolAnim === 'Lunge') {
      this.playToolAnimation('toollunge', 0, this.humanoid)
      return
    }
  }

  moveSit() {
    if (this.leftShoulder) {
      this.leftShoulder.MaxVelocity = 0.15
      this.leftShoulder.SetDesiredAngle(-3.14 / 2)
    }
    if (this.rightShoulder) {
      this.rightShoulder.MaxVelocity = 0.15
      this.rightShoulder.SetDesiredAngle(3.14 / 2)
    }
    if (this.leftHip) this.leftHip.SetDesiredAngle(-3.14 / 2)
    if (this.rightHip) this.rightHip.SetDesiredAngle(3.14 / 2)
  }

  move(time: number) {
    let amplitude = 1
    let frequency = 1
    const deltaTime = time - this.lastTick
    this.lastTick = time

    const climbFudge = 0
    let setAngles = false

    if (this.jumpAnimTime > 0) {
      this.jumpAnimTime = this.jumpAnimTime - deltaTime
    }
    if (!this.humanoid) return

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
      if (this.rightShoulder)
        this.rightShoulder.SetDesiredAngle(desiredAngle + climbFudge)
      if (this.leftShoulder)
        this.leftShoulder.SetDesiredAngle(desiredAngle - climbFudge)
      if (this.rightHip) this.rightHip.SetDesiredAngle(-desiredAngle)
      if (this.leftHip) this.leftHip.SetDesiredAngle(-desiredAngle)
    }
    // Tool Animation handling
    const tool = getTool(this.instance)
    if (tool && tool.FindFirstChild('Handle')) {
      const animStringValueObject = getToolAnim(tool)
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

  onStart() {
    this.torso = <BasePart>waitForChild(this.instance, 'Torso')
    this.rightShoulder = <Motor6D>waitForChild(this.torso, 'Right Shoulder')
    this.leftShoulder = <Motor6D>waitForChild(this.torso, 'Left Shoulder')
    this.rightHip = <Motor6D>waitForChild(this.torso, 'Right Hip')
    this.leftHip = <Motor6D>waitForChild(this.torso, 'Left Hip')
    this.neck = <Motor6D>waitForChild(this.torso, 'Neck')
    for (const child of this.instance.GetChildren()) {
      if (child.IsA('Humanoid')) {
        this.humanoid = child
      }
    }
    for (const [name, fileList] of Object.entries(this.animNames)) {
      this.configureAnimationSet(name, fileList)
    }
    if (!this.humanoid) return
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
    this.playAnimation('idle', 0.1, this.humanoid)
    this.pose = 'Standing'
    while (wait(0)[0]) {
      const [_, time] = wait(0)
      this.move(time)
    }
  }

  onRunning(speed: number) {
    if (speed > 0.01) {
      if (this.humanoid && this.humanoid.WalkSpeed < 17) {
        this.playAnimation('walk', 0.1, this.humanoid)
      } else if (this.humanoid && this.humanoid.WalkSpeed > 17) {
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
      if (this.humanoid) this.playAnimation('idle', 0.1, this.humanoid)
      this.pose = 'Standing'
    }
  }

  onDied() {
    this.pose = 'Dead'
  }

  onJumping() {
    if (this.humanoid) this.playAnimation('jump', 0.1, this.humanoid)
    this.jumpAnimTime = this.jumpAnimDuration
    this.pose = 'Jumping'
  }

  onClimbing(speed: number) {
    if (this.humanoid) this.playAnimation('climb', 0.1, this.humanoid)
    this.setAnimationSpeed(speed / 12.0)
    this.pose = 'Climbing'
  }

  onGettingUp() {
    this.pose = 'GettingUp'
  }

  onFreeFall() {
    if (this.humanoid && this.jumpAnimTime <= 0) {
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
}
