import { Players, Workspace } from '@rbxts/services'
import { ClientNetwork } from 'ReplicatedStorage/shared/network'
import type { ArcadeTableMechanics } from 'ReplicatedStorage/shared/tables/mechanics'
import { BehaviorObject } from 'ReplicatedStorage/shared/utils/behavior'
import {
  findDescendentsWhichAre,
  setNetworkOwner,
  weldParts,
} from 'ReplicatedStorage/shared/utils/instance'

export class AirHockeyMechanics implements ArcadeTableMechanics {
  puckNumber = 1

  onGameStart(tableName: string, userId: number) {
    const arcadeTable = game.Workspace.ArcadeTables.FindFirstChild(tableName)
    const pucks = arcadeTable?.FindFirstChild('Pucks')
    const puckTemplate = arcadeTable?.FindFirstChild<BasePart>('PuckTemplate')
    const ground = arcadeTable?.FindFirstChild<BasePart>('Ground')
    const puck = puckTemplate?.Clone()
    const player = Players.GetPlayerByUserId(userId)
    if (puck) {
      this.puckNumber = this.puckNumber + 1
      puck.Name = `Puck${this.puckNumber}`

      const parts = findDescendentsWhichAre<BasePart>(puck, 'BasePart', {
        includeSelf: true,
      })
      weldParts(parts)
      for (const part of parts) {
        part.Transparency = 0
        part.CanCollide = true
        part.Anchored = false
      }
      puck.Parent = pucks

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
      if (player) setNetworkOwner(puck, player)
    }
    if (player) {
      const control = arcadeTable?.FindFirstChild('Control')
      if (control) setNetworkOwner(control, player)
    }
  }

  onGameOver(tableName: ArcadeTableName, userId: number) {
    const arcadeTable = game.Workspace.ArcadeTables.FindFirstChild(tableName)
    const control = arcadeTable?.FindFirstChild('Control')
    if (!userId) {
      if (control) setNetworkOwner(control, undefined)
      return
    }
  }

  onClientInputBegan(
    _tableName: ArcadeTableName,
    _userId: number,
    _network: ClientNetwork,
    input: InputObject,
    _inputService?: UserInputService,
  ) {
    if (input.UserInputType === Enum.UserInputType.Keyboard) {
      if (input.KeyCode === Enum.KeyCode.A) {
        // body force
      } else if (input.KeyCode === Enum.KeyCode.D) {
        // body force
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
    _obj: BehaviorObject,
  ) {
    const airhockeyTable =
      game.Workspace.ArcadeTables.FindFirstChild<AirHockeyTable>(tableName)
    if (!airhockeyTable) return
  }
}
