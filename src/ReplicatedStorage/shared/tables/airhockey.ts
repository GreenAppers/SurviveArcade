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
  puckNumber = 1
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
    const pieces = arcadeTable?.FindFirstChild('Pieces')
    const puckTemplate = arcadeTable?.FindFirstChild<BasePart>('PuckTemplate')
    const control = arcadeTable?.FindFirstChild('Control')
    const controlPlane = arcadeTable?.FindFirstChild('ControlPlane')
    const seat = control?.FindFirstChild('Seat')
    const ground = arcadeTable?.FindFirstChild<BasePart>('Ground')
    const puck = puckTemplate?.Clone()
    const player = Players.GetPlayerByUserId(userId)
    if (seat) {
      if (!seat.FindFirstChild('PlaneConstraint')) {
        if (control) weldAssemblage(control)
        const constraint = new Instance('PlaneConstraint')
        constraint.Attachment1 = seat.FindFirstChild<Attachment>('Attachment')
        constraint.Attachment0 =
          controlPlane?.FindFirstChild<Attachment>('Attachment')
        constraint.Parent = seat
        const align = new Instance('AlignOrientation')
        align.Attachment0 = constraint.Attachment1
        align.Attachment1 = constraint.Attachment0
        align.AlignType = Enum.AlignType.AllAxes
        align.RigidityEnabled = true
        align.Parent = seat
      }
    }
    pieces?.GetChildren()?.forEach((piece) => piece.Destroy())
    if (puck) {
      this.puckNumber = this.puckNumber + 1
      weldAssemblage(puck)
      puck.Name = `Puck${this.puckNumber}`
      puck.Parent = pieces

      const sparks = puck.FindFirstChild<ParticleEmitter>('Sparks')
      const light = puck.FindFirstChild<PointLight>('Light')
      const gravity = puck.FindFirstChild<VectorForce>('VectorForce')
      if (sparks) sparks.Enabled = true
      if (light) light.Enabled = true
      if (gravity && ground) {
        gravity.Force = new Vector3(0, 1, 0)
          .sub(ground.CFrame.UpVector.Unit)
          .mul(Workspace.Gravity * puck.Mass)
      }
      if (player) {
        setNetworkOwner(puck, player)
        network.arcadeTableNewPiece.fire(player, tableName, 'Puck', puck.Name)
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
      } else if (input.KeyCode === Enum.KeyCode.W) {
        updateBodyVelocity(
          control,
          seat.CFrame.LookVector.mul(this.pusherSpeed),
        )
      } else if (input.KeyCode === Enum.KeyCode.S) {
        updateBodyVelocity(
          control,
          seat.CFrame.LookVector.mul(-this.pusherSpeed),
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

  onClientNewPiece(
    tableName: ArcadeTableName,
    _pieceType: string,
    pieceName: string,
  ) {
    const arcadeTable =
      game.Workspace.ArcadeTables.FindFirstChild<AirHockeyTable>(tableName)
    const ground = arcadeTable?.FindFirstChild<BasePart>('Ground')
    const pieces = arcadeTable?.FindFirstChild('Pieces')
    const ball = pieces?.FindFirstChild<BasePart>(pieceName)
    if (!ball) return

    const ballAttachment = ball.FindFirstChild<Attachment>('Attachment')
    const planeAttachment =
      arcadeTable?.PuckPlane?.FindFirstChild<Attachment>('Attachment')
    if (ballAttachment && planeAttachment) {
      const constraint = new Instance('PlaneConstraint')
      constraint.Attachment1 = planeAttachment
      constraint.Attachment0 = ballAttachment
      constraint.Parent = ball

      const align = new Instance('AlignOrientation')
      align.Attachment0 = constraint.Attachment1
      align.Attachment1 = constraint.Attachment0
      align.AlignType = Enum.AlignType.AllAxes
      align.RigidityEnabled = true
      align.Parent = ball
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
