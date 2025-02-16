import {
  ClientNetworkEvents,
  ServerNetworkEvents,
} from 'ReplicatedStorage/shared/network'
import { ArcadeTableState } from 'ReplicatedStorage/shared/state/ArcadeTablesState'
import { AirHockeyMechanics } from 'ReplicatedStorage/shared/tables/airhockey'
import { FoosballMechanics } from 'ReplicatedStorage/shared/tables/foosball'
import { PinballMechanics } from 'ReplicatedStorage/shared/tables/pinball'
import { BehaviorObject } from 'ReplicatedStorage/shared/utils/behavior'

export interface ArcadeTableMechanics {
  onCreateTablePart(
    arcadeTable: ArcadeTable,
    state: ArcadeTableState,
    part: BasePart,
  ): void

  onGameStart(
    tableName: ArcadeTableName,
    userId: number,
    network: ServerNetworkEvents,
  ): void

  onGameOver(tableName: ArcadeTableName, userId: number): void

  onScoreChanged(
    tableName: ArcadeTableName,
    arcadeTableState: ArcadeTableState,
  ): void

  onClientInputBegan(
    tableName: ArcadeTableName,
    userId: number,
    network: ClientNetworkEvents,
    input: InputObject,
    inputService?: UserInputService,
  ): void

  onClientInputEnded(
    tableName: ArcadeTableName,
    userId: number,
    network: ClientNetworkEvents,
    input: InputObject,
    inputService?: UserInputService,
  ): void

  onClientNewPiece(
    tableName: ArcadeTableName,
    pieceType: string,
    pieceName: string,
  ): void

  onNPCPlayingBehavior(
    tableName: ArcadeTableName,
    userId: number,
    obj: BehaviorObject,
  ): void
}

export const mechanics: Record<ArcadeTableType, ArcadeTableMechanics> = {
  AirHockey: new AirHockeyMechanics(),
  Foosball: new FoosballMechanics(),
  Pinball: new PinballMechanics(),
}
