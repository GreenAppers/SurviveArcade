import { OnStart, Service } from '@flamework/core'
import Object from '@rbxts/object-utils'
import { Players } from '@rbxts/services'
import { BallTag } from 'ReplicatedStorage/shared/constants/tags'
import {
  selectArcadeTablesState,
  selectArcadeTableState,
  selectGameState,
  selectPlayerScore,
} from 'ReplicatedStorage/shared/state'
import {
  arcadeTableNames,
  ArcadeTableStatus,
  initialScoreToWin,
  nextArcadeTableName,
} from 'ReplicatedStorage/shared/state/ArcadeTablesState'
import { MapService } from 'ServerScriptService/services/MapService'
import { store } from 'ServerScriptService/store'
import { getDescendentsWithTag } from 'ServerScriptService/utils'

@Service()
export class GameService implements OnStart {
  constructor(private mapService: MapService) {}

  changeRound() {
    print('Changing round')
    store.startNewRound()
    store.resetArcadeTables()
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
          const arcadeTable = game.Workspace.ArcadeTables[name]

          // Trigger winning sequence when threshhold score exceeded.
          const userScoreSelector = selectPlayerScore(userId)
          const score = userScoreSelector(newState)?.score || 0
          if (score > arcadeTableState.scoreToWin) {
            store.updateArcadeTableStatus(name, ArcadeTableStatus.Won)
            if (arcadeTable) {
              if (arcadeTable.Backbox) {
                arcadeTable.Backbox.Frame?.Explosion?.Emit(2000)
                for (const descendent of arcadeTable.Backbox.GetDescendants()) {
                  if (descendent.IsA('BasePart')) {
                    descendent.Transparency = 1
                  } else if (descendent.IsA('Decal')) {
                    descendent.Transparency = 1
                  }
                }
              }
              arcadeTable.Barrier?.Destroy()
              const balls = getDescendentsWithTag(arcadeTable.Balls, BallTag)
              for (const ball of balls) ball.Destroy()
              task.wait(2.2)
              arcadeTable.Backbox?.Destroy()
            }
            this.mapService.chainNextTable(name)
          }
        }
      }

      this.restoreUnusedTables()
    }
  }

  restoreUnusedTables() {
    const playerHumanoidRootParts = Players.GetPlayers().map((x) =>
      playerHumanoidRootPart(x),
    )
    const state = store.getState()
    for (const arcadeTableName of arcadeTableNames) {
      const arcadeTableState = selectArcadeTableState(arcadeTableName)(state)
      if (
        arcadeTableState?.status === ArcadeTableStatus.Active &&
        arcadeTableState?.scoreToWin === initialScoreToWin
      )
        continue
      const arcadeTable = <ArcadeTable>(
        game.Workspace.ArcadeTables.FindFirstChild(arcadeTableName)
      )
      const nextArcadeTable = <ArcadeTable>(
        game.Workspace.ArcadeTables.FindFirstChild(
          nextArcadeTableName(arcadeTableName),
        )
      )
      let foundPlayerInPlayZone = false
      for (const playerHumanoidRootPart of playerHumanoidRootParts) {
        if (!playerHumanoidRootPart) continue
        if (
          (arcadeTable &&
            isWithinBox(
              arcadeTable.PlayZone,
              playerHumanoidRootPart.Position,
            )) ||
          (nextArcadeTable &&
            isWithinBox(
              nextArcadeTable.PlayZone,
              playerHumanoidRootPart.Position,
            ))
        ) {
          foundPlayerInPlayZone = true
          break
        }
      }
      if (foundPlayerInPlayZone) continue
      this.mapService.resetTable(arcadeTableName)
    }
  }
}

export function playerHumanoidRootPart(player: Player) {
  const character = <PlayerCharacter | undefined>player?.Character
  return <BasePart | undefined>character?.WaitForChild('HumanoidRootPart')
}

export function isWithinBox(brick: BasePart, position: Vector3) {
  const v3 = brick.CFrame.PointToObjectSpace(position)
  return (
    math.abs(v3.X) <= brick.Size.X / 2 &&
    math.abs(v3.Y) <= brick.Size.Y / 2 &&
    math.abs(v3.Z) <= brick.Size.Z / 2
  )
}
