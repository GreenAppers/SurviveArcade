import { Players, Workspace } from '@rbxts/services'
import {
  ClientNetworkEvents,
  ServerNetworkEvents,
} from 'ReplicatedStorage/shared/network'
import { ArcadeTableState } from 'ReplicatedStorage/shared/state/ArcadeTablesState'
import { type ArcadeTableMechanics } from 'ReplicatedStorage/shared/tables/mechanics'
import { updateScoreboard } from 'ReplicatedStorage/shared/utils/arcade'
import { BehaviorObject } from 'ReplicatedStorage/shared/utils/behavior'
import {
  setNetworkOwner,
  updateBodyVelocity,
  weldAssemblage,
} from 'ReplicatedStorage/shared/utils/instance'

const scoreboardCharacters = 13

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
    const control = arcadeTable?.FindFirstChild('Control')
    const controlPlane = arcadeTable?.FindFirstChild('ControlPlane')
    const seat = control?.FindFirstChild('Seat')
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
    if (player) {
      const control = arcadeTable?.FindFirstChild('Control')
      if (control) setNetworkOwner(control, player)
    }
    this.resetPuck(tableName, arcadeTable, player, network)
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

  onScoreChanged(
    tableName: ArcadeTableName,
    arcadeTableState: ArcadeTableState,
  ) {
    this.updateScoreboard(tableName, arcadeTableState)
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
      switch (input.KeyCode) {
        case Enum.KeyCode.A:
        case Enum.KeyCode.W:
        case Enum.KeyCode.S:
        case Enum.KeyCode.D:
          this.updateControlVelocity(control, seat.CFrame, input.KeyCode, 1)
          break
        default:
          break
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
    const seat = control?.FindFirstChild<Seat>('Seat')
    if (!control || !seat) return
    if (input.UserInputType === Enum.UserInputType.Keyboard) {
      switch (input.KeyCode) {
        case Enum.KeyCode.A:
        case Enum.KeyCode.W:
        case Enum.KeyCode.S:
        case Enum.KeyCode.D:
          this.updateControlVelocity(control, seat.CFrame, input.KeyCode, -1)
          break
        default:
          break
      }
    }
  }

  onClientNewPiece(
    tableName: ArcadeTableName,
    pieceType: string,
    pieceName: string,
  ) {
    const arcadeTable =
      game.Workspace.ArcadeTables.FindFirstChild<AirHockeyTable>(tableName)
    const pieces = arcadeTable?.FindFirstChild('Pieces')
    const piece = pieces?.FindFirstChild<BasePart>(pieceName)
    if (!arcadeTable || !piece) return
    if (pieceType === 'Puck') {
      this.onClientNewPuck(arcadeTable, piece)
    }
  }

  onClientNewPuck(arcadeTable: AirHockeyTable, puck: BasePart) {
    const puckAttachment = puck.FindFirstChild<Attachment>('Attachment')
    const planeAttachment =
      arcadeTable?.PuckPlane?.FindFirstChild<Attachment>('Attachment')
    if (puckAttachment && planeAttachment) {
      const constraint = new Instance('PlaneConstraint')
      constraint.Attachment0 = planeAttachment
      constraint.Attachment1 = puckAttachment
      constraint.Parent = puck

      const align = new Instance('AlignOrientation')
      align.Attachment0 = constraint.Attachment1
      align.Attachment1 = constraint.Attachment0
      align.AlignType = Enum.AlignType.AllAxes
      align.RigidityEnabled = true
      align.Parent = puck
    }

    const ground = arcadeTable?.FindFirstChild<BasePart>('Ground')
    randomKickInPlane(puck, ground?.CFrame || new CFrame(), 10000)
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

  updateControlVelocity(
    control: Instance,
    frame: CFrame,
    keyCode: Enum.KeyCode,
    scale: number,
  ) {
    if (keyCode === Enum.KeyCode.A) {
      updateBodyVelocity(
        control,
        frame.RightVector.mul(-this.pusherSpeed * scale),
        true,
      )
    } else if (keyCode === Enum.KeyCode.D) {
      updateBodyVelocity(
        control,
        frame.RightVector.mul(this.pusherSpeed * scale),
        true,
      )
    } else if (keyCode === Enum.KeyCode.W) {
      updateBodyVelocity(
        control,
        frame.LookVector.mul(this.pusherSpeed * scale),
        true,
      )
    } else if (keyCode === Enum.KeyCode.S) {
      updateBodyVelocity(
        control,
        frame.LookVector.mul(-this.pusherSpeed * scale),
        true,
      )
    }
  }

  updateScoreboard(
    tableName: ArcadeTableName,
    arcadeTableState: ArcadeTableState,
  ) {
    updateScoreboard(
      tableName,
      `home ${arcadeTableState.goalsHome} away ${arcadeTableState.goalsAway}`,
      scoreboardCharacters,
    )
  }

  resetPuck(
    tableName: ArcadeTableName,
    arcadeTable: ArcadeTable | undefined,
    player: Player | undefined,
    network: ServerNetworkEvents,
  ) {
    const pieces = arcadeTable?.FindFirstChild('Pieces')
    const ground = arcadeTable?.FindFirstChild<BasePart>('Ground')
    const puckTemplate = arcadeTable?.FindFirstChild<BasePart>('PuckTemplate')
    const puck = puckTemplate?.Clone()
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
  part.ApplyImpulse(kick)
}
