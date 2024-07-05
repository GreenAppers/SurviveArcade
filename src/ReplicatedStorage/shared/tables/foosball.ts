import { ClientNetwork } from 'ReplicatedStorage/shared/network'
import type { ArcadeTableMechanics } from 'ReplicatedStorage/shared/tables/mechanics'
import { BehaviorObject } from 'ReplicatedStorage/shared/utils/behavior'

export class FoosballMechanics implements ArcadeTableMechanics {
  puckNumber = 1

  onGameStart(_tableName: string, _userId: number) {}

  onGameOver(_tableName: ArcadeTableName, _userId: number) {}

  onClientInputBegan(
    _tableName: ArcadeTableName,
    _userId: number,
    _network: ClientNetwork,
    _input: InputObject,
    _inputService?: UserInputService,
  ) {}

  onClientInputEnded(
    _tableName: ArcadeTableName,
    _userId: number,
    _network: ClientNetwork,
    _input: InputObject,
    _inputService?: UserInputService,
  ) {}

  onNPCPlayingBehavior(
    _tableName: ArcadeTableName,
    _userId: number,
    _obj: BehaviorObject,
  ) {}
}
