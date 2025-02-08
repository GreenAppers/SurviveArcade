import { Players, Workspace } from '@rbxts/services'
import {
  ClientNetworkEvents,
  ServerNetworkEvents,
} from 'ReplicatedStorage/shared/network'
import { ArcadeTableState } from 'ReplicatedStorage/shared/state/ArcadeTablesState'
import type { ArcadeTableMechanics } from 'ReplicatedStorage/shared/tables/mechanics'
import { BehaviorObject } from 'ReplicatedStorage/shared/utils/behavior'
import {
  setNetworkOwner,
  updateBodyVelocity,
  weldAssemblage,
} from 'ReplicatedStorage/shared/utils/instance'

export class AirHockeyMechanics implements ArcadeTableMechanics {
  ballNumber = 1
  pusherSpeed = 35

  onCreateTablePart(
    _arcadeTable: ArcadeTable,
    state: ArcadeTableState,
    part: BasePart,
  ) {
    part.BrickColor = state.color
  }

  onGameStart(
    tableName: ArcadeTableName,
    userId: number,
    network: ServerNetworkEvents,
  ) {
    const arcadeTable =
      game.Workspace.ArcadeTables.FindFirstChild<AirHockeyTable>(tableName)
    const balls = arcadeTable?.FindFirstChild('Balls')
    const ballTemplate = arcadeTable?.FindFirstChild<BasePart>('BallTemplate')
    const control = arcadeTable?.FindFirstChild('Control')
    const controlPlane = arcadeTable?.FindFirstChild('ControlPlane')
    const seat = control?.FindFirstChild('Seat')
    const ground = arcadeTable?.FindFirstChild<BasePart>('Ground')
    const ball = ballTemplate?.Clone()
    const player = Players.GetPlayerByUserId(userId)
    if (seat) {
      if (!seat.FindFirstChild('PrismaticConstraint')) {
        if (control) weldAssemblage(control)
        const constraint = new Instance('PrismaticConstraint')
        constraint.Attachment0 = seat.FindFirstChild<Attachment>('Attachment')
        constraint.Attachment1 =
          controlPlane?.FindFirstChild<Attachment>('Attachment')
        constraint.Parent = seat
      }
    }
    balls?.GetChildren()?.forEach((ball) => ball.Destroy())
    if (ball) {
      this.ballNumber = this.ballNumber + 1
      weldAssemblage(ball)
      ball.Name = `Puck${this.ballNumber}`
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
      if (player) {
        setNetworkOwner(ball, player)
        network.arcadeTableNewBall.fire(player, tableName, ball.Name)
      }
    }
    if (player) {
      const control = arcadeTable?.FindFirstChild('Control')
      if (control) setNetworkOwner(control, player)
    }
  }

  onGameOver(tableName: ArcadeTableName, userId: number) {
    const arcadeTable =
      game.Workspace.ArcadeTables.FindFirstChild<AirHockeyTable>(tableName)
    const control = arcadeTable?.FindFirstChild('Control')
    if (!userId) {
      if (control) setNetworkOwner(control, undefined)
      return
    }
  }

  onClientInputBegan(
    tableName: ArcadeTableName,
    _userId: number,
    _network: ClientNetworkEvents,
    input: InputObject,
    _inputService?: UserInputService,
  ) {
    const arcadeTable =
      game.Workspace.ArcadeTables.FindFirstChild<AirHockeyTable>(tableName)
    const control = arcadeTable?.FindFirstChild('Control')
    const seat = control?.FindFirstChild<Seat>('Seat')
    if (!control || !seat) return
    if (input.UserInputType === Enum.UserInputType.Keyboard) {
      if (input.KeyCode === Enum.KeyCode.A) {
        updateBodyVelocity(
          control,
          seat.CFrame.RightVector.mul(-this.pusherSpeed),
        )
      } else if (input.KeyCode === Enum.KeyCode.D) {
        updateBodyVelocity(
          control,
          seat.CFrame.RightVector.mul(this.pusherSpeed),
        )
      }
    }
  }

  onClientInputEnded(
    tableName: ArcadeTableName,
    _userId: number,
    _network: ClientNetworkEvents,
    input: InputObject,
    _inputService?: UserInputService,
  ) {
    const arcadeTable =
      game.Workspace.ArcadeTables.FindFirstChild<AirHockeyTable>(tableName)
    const control = arcadeTable?.FindFirstChild('Control')
    if (!control) return
    if (input.UserInputType === Enum.UserInputType.Keyboard) {
      if (
        input.KeyCode === Enum.KeyCode.A ||
        input.KeyCode === Enum.KeyCode.D
      ) {
        updateBodyVelocity(control, undefined)
      }
    }
  }

  onClientNewBall(tableName: ArcadeTableName, ballName: string) {
    const arcadeTable =
      game.Workspace.ArcadeTables.FindFirstChild<AirHockeyTable>(tableName)
    const ground = arcadeTable?.FindFirstChild<BasePart>('Ground')
    const balls = arcadeTable?.FindFirstChild('Balls')
    const ball = balls?.FindFirstChild<BasePart>(ballName)
    if (!ball) return

    const ballAttachment = ball.FindFirstChild<Attachment>('Attachment')
    const planeAttachment =
      arcadeTable?.PuckPlane?.FindFirstChild<Attachment>('Attachment')
    if (ballAttachment && planeAttachment) {
      const constraint = new Instance('PlaneConstraint')
      constraint.Attachment1 = planeAttachment
      constraint.Attachment0 = ballAttachment
      constraint.Parent = ball
    }

    randomKickInPlane(ball, ground?.CFrame || new CFrame(), 10000)
  }

  onNPCPlayingBehavior(
    tableName: ArcadeTableName,
    _userId: number,
    _obj: BehaviorObject,
  ) {
    const airhockeyTable =
      game.Workspace.ArcadeTables.FindFirstChild<AirHockeyTable>(tableName)
    if (!airhockeyTable) return
  }
}

export function randomKickInPlane(
  part: BasePart,
  plane: CFrame,
  force: number,
) {
  const randomAngle = math.random() * math.pi * 2
  const kick = plane.ToWorldSpace(
    new CFrame(math.cos(randomAngle) * force, 0, math.sin(randomAngle) * force),
  ).Position
  print('give kick', part, kick)
  part.ApplyImpulse(kick)
}
