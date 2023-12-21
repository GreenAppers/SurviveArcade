import { OnStart, Service } from '@flamework/core'
import Object from '@rbxts/object-utils'
import {
  selectArcadeTablesState,
  selectGameState,
} from 'ReplicatedStorage/shared/state'
import { store } from 'ServerScriptService/store'

import { MapService } from './MapService'

@Service()
export class GameService implements OnStart {
  constructor(private mapService: MapService) {}

  changeRound() {
    print('Changing round')
    store.startNewRound()
    store.resetScores()
    this.mapService.loadMap('Map2')
  }

  onStart() {
    const gameSelector = selectGameState()
    const arcadeTablesSelector = selectArcadeTablesState()

    for (;;) {
      task.wait(1)
      const state = store.getState()
      const gameState = gameSelector(state)

      // Update seconds remaining until starting a new round
      const remaining =
        gameState.roundLength -
        (DateTime.now().UnixTimestamp - gameState.roundStarted.UnixTimestamp)
      if (remaining <= 0) this.changeRound()
      else store.setRoundRemaining(remaining)

      // Increase players' score for each second owning an arcade table.
      const arcadeTablesState = arcadeTablesSelector(state)
      for (const arcadeTableState of Object.values(arcadeTablesState)) {
        if (arcadeTableState.owner)
          store.addScore(arcadeTableState.owner.UserId, 10)
      }
    }
  }
}
