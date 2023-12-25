import { OnStart, Service } from '@flamework/core'
import Object from '@rbxts/object-utils'
import {
  selectArcadeTablesState,
  selectGameState,
  selectPlayerScore,
} from 'ReplicatedStorage/shared/state'
import { ArcadeTableStatus } from 'ReplicatedStorage/shared/state/ArcadeTablesState'
import { MapService } from 'ServerScriptService/services/MapService'
import { store } from 'ServerScriptService/store'

@Service()
export class GameService implements OnStart {
  constructor(private mapService: MapService) {}

  changeRound() {
    print('Changing round')
    store.startNewRound()
    store.resetScores()
    this.mapService.loadMap('Map1')
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

      const arcadeTablesState = arcadeTablesSelector(state)
      for (const [name, arcadeTableState] of Object.entries(
        arcadeTablesState,
      )) {
        if (arcadeTableState.owner) {
          // Increase players' score for each second owning an arcade table.
          const userId = arcadeTableState.owner.UserId
          const newState = store.addScore(userId, 10)
          if (arcadeTableState.status !== ArcadeTableStatus.Active) continue

          // Trigger winning sequence when threshhold score exceeded.
          const userScoreSelector = selectPlayerScore(userId)
          const score = userScoreSelector(newState)?.score || 0
          if (score > arcadeTableState.scoreToWin) {
            const arcadeTable = game.Workspace.ArcadeTables[name]
            if (arcadeTable) {
              arcadeTable.Barrier?.Destroy()
              arcadeTable.Backbox?.Destroy()
            }
            store.updateArcadeTableStatus(name, ArcadeTableStatus.Won)
            this.mapService.chainNextTable(name)
          }
        }
      }
    }
  }
}
