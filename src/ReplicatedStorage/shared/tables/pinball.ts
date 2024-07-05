import { Players, Workspace } from '@rbxts/services'
import { ClientNetwork } from 'ReplicatedStorage/shared/network'
import type { ArcadeTableMechanics } from 'ReplicatedStorage/shared/tables/mechanics'
import {
  BehaviorObject,
  getBehaviorTime,
} from 'ReplicatedStorage/shared/utils/behavior'
import { setNetworkOwner } from 'ReplicatedStorage/shared/utils/instance'

const flipperCooldown = 0.3
const flipperFireDistance = 7

export class PinballMechanics implements ArcadeTableMechanics {
  ballNumber = 1
  fullForceKeypress = 0

  onGameStart(tableName: string, userId: number) {
    const arcadeTable = game.Workspace.ArcadeTables.FindFirstChild(tableName)
    const balls = arcadeTable?.FindFirstChild('Balls')
    const ballTemplate = arcadeTable?.FindFirstChild<BasePart>('BallTemplate')
    const ground = arcadeTable?.FindFirstChild<BasePart>('Ground')
    const ball = ballTemplate?.Clone()
    const player = Players.GetPlayerByUserId(userId)
    if (ball) {
      this.ballNumber = this.ballNumber + 1
      ball.Name = `Ball${this.ballNumber}`
      ball.Transparency = 0
      ball.CanCollide = true
      ball.Anchored = false
      ball.Parent = balls
      const sparks = ball.FindFirstChild<ParticleEmitter>('Sparks')
      const light = ball.FindFirstChild<PointLight>('Light')
      const gravity = ball.FindFirstChild<VectorForce>('VectorForce')
      if (sparks) sparks.Enabled = true
      if (light) light.Enabled = true
      if (gravity && ground) {
        gravity.Force = new Vector3(0, 1, 0)
          .sub(ground.CFrame.UpVector.Unit)
          .mul(Workspace.Gravity * ball.Mass)
      }
      if (player) setNetworkOwner(ball, player)
    }
    if (player) {
      const flipperLeft = arcadeTable?.FindFirstChild<Flipper>('FlipperLeft')
      const flipperRight = arcadeTable?.FindFirstChild<Flipper>('FlipperRight')
      const spinnerLeft = arcadeTable?.FindFirstChild<Spinner>('SpinnerLeft')
      if (flipperLeft) setNetworkOwner(flipperLeft, player)
      if (flipperRight) setNetworkOwner(flipperRight, player)
      if (spinnerLeft) setNetworkOwner(spinnerLeft, player)
    }
  }

  onGameOver(tableName: ArcadeTableName, userId: number) {
    const arcadeTable = game.Workspace.ArcadeTables.FindFirstChild(tableName)
    const flipperLeft = arcadeTable?.FindFirstChild<Flipper>('FlipperLeft')
    const flipperRight = arcadeTable?.FindFirstChild<Flipper>('FlipperRight')
    const spinnerLeft = arcadeTable?.FindFirstChild<Spinner>('SpinnerLeft')
    if (!userId) {
      if (flipperLeft) setNetworkOwner(flipperLeft, undefined)
      if (flipperRight) setNetworkOwner(flipperRight, undefined)
      if (spinnerLeft) setNetworkOwner(spinnerLeft, undefined)
      return
    }
  }

  onClientInputBegan(
    tableName: ArcadeTableName,
    _userId: number,
    network: ClientNetwork,
    input: InputObject,
    inputService?: UserInputService,
  ) {
    if (input.UserInputType === Enum.UserInputType.Keyboard) {
      let flipperName = ''
      if (input.KeyCode === Enum.KeyCode.A) flipperName = 'FlipperLeft'
      else if (input.KeyCode === Enum.KeyCode.D) flipperName = 'FlipperRight'
      if (flipperName) {
        let force = 1
        if (this.fullForceKeypress && inputService) {
          const startTick = tick()
          let keyHeldDownFor = 0
          while (
            keyHeldDownFor < this.fullForceKeypress &&
            inputService.IsKeyDown(input.KeyCode)
          ) {
            keyHeldDownFor = tick() - startTick
            task.wait()
          }
          force = math.max(1, keyHeldDownFor / this.fullForceKeypress)
        }
        const arcadeTable =
          game.Workspace.ArcadeTables.FindFirstChild<ArcadeTable>(tableName)
        if (arcadeTable) {
          flipPinballFlipper(arcadeTable, flipperName, force)
          network.arcadeTableEvent.fire(
            tableName,
            [flipperName],
            'FlipperSound',
          )
        }
      }
    }
  }

  onClientInputEnded(
    _tableName: ArcadeTableName,
    _userId: number,
    _network: ClientNetwork,
    _input: InputObject,
    _inputService?: UserInputService,
  ) {}

  onNPCPlayingBehavior(
    tableName: ArcadeTableName,
    _userId: number,
    obj: BehaviorObject,
  ) {
    const pinballTable =
      game.Workspace.ArcadeTables.FindFirstChild<PinballTable>(tableName)
    if (!pinballTable) return
    const leftFlipperPosition =
      pinballTable.FlipperLeft.Flipper.Wedge2.CFrame.ToWorldSpace(
        new CFrame(),
      ).Position
    const rightFlipperPosition =
      pinballTable.FlipperRight.Flipper.Wedge1.CFrame.ToWorldSpace(
        new CFrame(),
      ).Position
    for (const ball of pinballTable.Balls.GetChildren<BasePart>()) {
      const ballPosition = ball.CFrame.ToWorldSpace(new CFrame()).Position
      const leftDistance = ballPosition.sub(leftFlipperPosition).Magnitude
      const rightDistance = ballPosition.sub(rightFlipperPosition).Magnitude
      if (
        leftDistance < flipperFireDistance ||
        rightDistance < flipperFireDistance
      ) {
        const time = getBehaviorTime(obj)
        if (
          leftDistance < rightDistance &&
          time - (obj.Blackboard.lastFlipperLeft ?? 0) > flipperCooldown
        ) {
          flipPinballFlipper(pinballTable, 'FlipperLeft')
          obj.Blackboard.lastFlipperLeft = time
        } else if (
          time - (obj.Blackboard.lastFlipperRight ?? 0) >
          flipperCooldown
        ) {
          flipPinballFlipper(pinballTable, 'FlipperRight')
          obj.Blackboard.lastFlipperRight = time
        }
      }
    }
  }
}

export function flipPinballFlipper(
  arcadeTable?: ArcadeTable,
  flipperName?: string,
  force?: number,
) {
  if (!arcadeTable || !flipperName) return
  const flipperModel = arcadeTable.FindFirstChild(flipperName)
  const flipper = flipperModel?.FindFirstChild('Flipper')
  const rotor = flipper?.FindFirstChild<BasePart>('Rotor')
  if (!rotor) return
  const orientation = flipperName === 'FlipperRight' ? -1 : 1
  rotor.ApplyAngularImpulse(
    rotor.CFrame.RightVector.mul(orientation * 600000 * (force ?? 1)),
  )
}
