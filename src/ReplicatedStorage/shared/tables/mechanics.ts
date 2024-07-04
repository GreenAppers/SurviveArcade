import { ClientNetwork } from 'ReplicatedStorage/shared/network'
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

  onNPCPlayingBehavior(
    tableName: ArcadeTableName,
    userId: number,
    obj: BehaviorObject,
  ): void
}

export const mechanics: Record<ArcadeTableType, ArcadeTableMechanics> = {
  AirHockey: new PinballMechanics(),
  Foosball: new PinballMechanics(),
  Pinball: new PinballMechanics(),
}
