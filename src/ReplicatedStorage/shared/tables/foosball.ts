import {
  ClientNetworkEvents,
  ServerNetworkEvents,
} from 'ReplicatedStorage/shared/network'
import type { ArcadeTableMechanics } from 'ReplicatedStorage/shared/tables/mechanics'
import { BehaviorObject } from 'ReplicatedStorage/shared/utils/behavior'

export class FoosballMechanics implements ArcadeTableMechanics {
  puckNumber = 1

  onGameStart(
    _tableName: ArcadeTableName,
    _userId: number,
    _network: ServerNetworkEvents,
  ) {}

  onGameOver(_tableName: ArcadeTableName, _userId: number) {}

  onClientInputBegan(
    _tableName: ArcadeTableName,
    _userId: number,
    _network: ClientNetworkEvents,
    _input: InputObject,
    _inputService?: UserInputService,
  ) {}

  onClientInputEnded(
    _tableName: ArcadeTableName,
    _userId: number,
    _network: ClientNetworkEvents,
    _input: InputObject,
    _inputService?: UserInputService,
  ) {}

  onClientNewBall(_tableName: ArcadeTableName, _ballName: string) {}

  onNPCPlayingBehavior(
    _tableName: ArcadeTableName,
    _userId: number,
    _obj: BehaviorObject,
  ) {}
}
