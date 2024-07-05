import { ClientNetwork } from 'ReplicatedStorage/shared/network'
import { AirHockeyMechanics } from 'ReplicatedStorage/shared/tables/airhockey'
import { FoosballMechanics } from 'ReplicatedStorage/shared/tables/foosball'
import { PinballMechanics } from 'ReplicatedStorage/shared/tables/pinball'
import { BehaviorObject } from 'ReplicatedStorage/shared/utils/behavior'

export interface ArcadeTableMechanics {
  onGameStart(tableName: string, userId: number): void
  onGameOver(tableName: ArcadeTableName, userId: number): void

  onClientInputBegan(
    tableName: ArcadeTableName,
    userId: number,
    network: ClientNetwork,
    input: InputObject,
    inputService?: UserInputService,
  ): void

  onClientInputEnded(
    tableName: ArcadeTableName,
    userId: number,
    network: ClientNetwork,
    input: InputObject,
    inputService?: UserInputService,
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
