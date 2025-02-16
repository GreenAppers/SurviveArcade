import { OnStart, Service } from '@flamework/core'
import { Logger } from '@rbxts/log'
import Object from '@rbxts/object-utils'
import { playSoundId } from 'ReplicatedStorage/shared/assets/sounds/play-sound'
import { CURRENCY_TYPES } from 'ReplicatedStorage/shared/constants/core'
import { BallTag } from 'ReplicatedStorage/shared/constants/tags'
import {
  selectArcadeTablesState,
  selectArcadeTableType,
  selectPlayerScore,
} from 'ReplicatedStorage/shared/state'
import {
  ArcadeTableScoreDomain,
  ArcadeTableState,
  ArcadeTableStatus,
} from 'ReplicatedStorage/shared/state/ArcadeTablesState'
import { mechanics } from 'ReplicatedStorage/shared/tables/mechanics'
import {
  findDescendentsWithTag,
  findDescendentWithPath,
} from 'ReplicatedStorage/shared/utils/instance'
import { getNameFromUserId } from 'ReplicatedStorage/shared/utils/player'
import { Events } from 'ServerScriptService/network'
import { MapService } from 'ServerScriptService/services/MapService'
import { store } from 'ServerScriptService/store'
import { EXCHANGE, executeExchange } from 'ServerScriptService/utils/exchange'
import { logAndBroadcast } from 'ServerScriptService/utils/server'

@Service()
export class ArcadeTableService implements OnStart {
  constructor(
    private readonly mapService: MapService,
    private readonly logger: Logger,
  ) {}

  addScore(
    userId: number,
    tableName: ArcadeTableName,
    tableType: ArcadeTableType,
    amount: number,
  ) {
    store.addArcadeTableScore(tableName, amount)
    return store.addPlayerScore(userId, tableType, amount)
  }

  claimArcadeTable(tableName: ArcadeTableName, userId?: number) {
    if (!userId) return store.claimArcadeTable(tableName, undefined)
    const tableType = store.getState(selectArcadeTableType(tableName))
    const exchange = EXCHANGE[tableType]
    if (!executeExchange(userId, exchange)) return undefined
    store.addPlayerTablePlays(userId)
    return store.claimArcadeTable(tableName, userId)
  }

  startArcadeTablesSubscription() {
    store.subscribe(
      selectArcadeTablesState(),
      (arcadeTablesState, previousArcadeTablesState) => {
        for (const [tableName, arcadeTableState] of Object.entries(
          arcadeTablesState,
        )) {
          const previousArcadeTableState = previousArcadeTablesState[tableName]

          // Handle score changed
          if (
            arcadeTableState.score !== previousArcadeTableState?.score &&
            arcadeTableState.owner
          )
            this.onScoreChanged(tableName, arcadeTableState)

          // Handle game won
          if (arcadeTableState.status === ArcadeTableStatus.Won) {
            if (
              previousArcadeTableState?.status !== ArcadeTableStatus.Won &&
              arcadeTableState.owner
            )
              this.onGameWon(tableName, arcadeTableState)
            continue
          }

          // Handle claim change
          if (arcadeTableState.owner !== previousArcadeTableState?.owner) {
            if (arcadeTableState.owner) {
              this.onPlayerClaimed(
                arcadeTableState.owner,
                tableName,
                arcadeTableState,
              )
              this.onGameStart(tableName, arcadeTableState.owner)
            } else if (previousArcadeTableState?.owner) {
              this.onPlayerClaimEnded(
                previousArcadeTableState.owner,
                tableName,
                arcadeTableState,
                previousArcadeTableState,
              )
            }
          }

          // Handle table change
          if (
            previousArcadeTableState?.sequence === 0 &&
            arcadeTableState.sequence === 0 &&
            previousArcadeTableState?.tableMap !== arcadeTableState?.tableMap
          ) {
            this.logger.Info(
              `Table ${tableName} changed from ${previousArcadeTableState?.tableMap} to ${arcadeTableState?.tableMap}`,
            )
            this.mapService.resetTableWithState(tableName, arcadeTableState)
          }
        }
      },
    )
  }

  startArcadeTablesControlEventHandler() {
    Events.arcadeTableEvent.connect((_player, tableName, partPath, soundName) =>
      this.onTableEvent(tableName, partPath, soundName),
    )
  }

  onStart() {
    this.startArcadeTablesSubscription()
    this.startArcadeTablesControlEventHandler()
    const arcadeTablesSelector = selectArcadeTablesState()

    for (;;) {
      task.wait(1)
      const state = store.getState()
      const arcadeTablesState = arcadeTablesSelector(state)
      for (const [name, arcadeTableState] of Object.entries(
        arcadeTablesState,
      )) {
        if (arcadeTableState.owner) {
          // Increase players' score for each second owning an arcade table.
          const userId = arcadeTableState.owner
          const newState = this.addScore(
            userId,
            arcadeTableState.tableName,
            arcadeTableState.tableType,
            10,
          )

          // Trigger winning sequence when threshhold score exceeded.
          if (arcadeTableState.status === ArcadeTableStatus.Active) {
            if (
              arcadeTableState.scoreDomain === ArcadeTableScoreDomain.Player
            ) {
              const userScoreSelector = selectPlayerScore(userId)
              const score = userScoreSelector(newState)
              if (score > arcadeTableState.scoreToWin)
                store.updateArcadeTableStatus(name, ArcadeTableStatus.Won)
            } else if (
              arcadeTableState.scoreDomain === ArcadeTableScoreDomain.Table &&
              arcadeTableState.score > arcadeTableState.scoreToWin
            ) {
              store.updateArcadeTableStatus(name, ArcadeTableStatus.Won)
            }
          }
        }
      }
    }
  }

  onPlayerClaimed(
    _userId: number,
    _tableName: ArcadeTableName,
    _tableState: ArcadeTableState,
  ) {}

  onPlayerClaimEnded(
    userId: number,
    tableName: ArcadeTableName,
    _tableState: ArcadeTableState,
    previousTableState: ArcadeTableState,
  ) {
    this.onGameOver(tableName, userId, previousTableState.score)
  }

  onTableEvent(tableName: string, partPath: string[], soundName?: string) {
    const arcadeTable = game.Workspace.ArcadeTables.FindFirstChild(tableName)
    const part = findDescendentWithPath(arcadeTable, partPath)
    if (part && soundName) {
      const sound = findDescendentWithPath<Sound>(arcadeTable, [
        'Audio',
        soundName,
      ])
      if (sound) playSoundId(part, sound.SoundId)
    }
  }

  onGameWon(tableName: ArcadeTableName, arcadeTableState: ArcadeTableState) {
    const userId = arcadeTableState.owner
    const score = arcadeTableState.score
    logAndBroadcast(
      this.logger,
      `${tableName}.${arcadeTableState.sequence} won by ${getNameFromUserId(userId, game.Workspace)} with ${score}`,
    )
    Promise.try(() =>
      this.playWinningSequence(game.Workspace.ArcadeTables[tableName]),
    ).then(() => {
      this.mapService.createNextTable(tableName)
      this.onGameOver(tableName, userId, score)
    })
  }

  onGameOver(tableName: ArcadeTableName, userId: number, score: number) {
    const tableType = store.getState(selectArcadeTableType(tableName))
    mechanics[tableType].onGameOver(tableName, userId)

    const payout = math.floor(score / 1000)
    if (payout >= 1)
      store.addPlayerCurrency(userId, CURRENCY_TYPES.Tickets, payout)
  }

  onGameStart(tableName: ArcadeTableName, userId: number) {
    const tableType = store.getState(selectArcadeTableType(tableName))
    mechanics[tableType].onGameStart(tableName, userId, Events)
  }

  onScoreChanged(
    tableName: ArcadeTableName,
    arcadeTableState: ArcadeTableState,
  ) {
    const tableType = store.getState(selectArcadeTableType(tableName))
    mechanics[tableType].onScoreChanged(tableName, arcadeTableState)
  }

  async playWinningSequence(arcadeTable: ArcadeTable | undefined) {
    if (!arcadeTable) return

    const backbox = arcadeTable.FindFirstChild<ArcadeTableBackbox>('Backbox')
    if (backbox) {
      const audio = arcadeTable.FindFirstChild<{ WinSound?: Sound }>('Audio')
      if (audio?.WinSound) playSoundId(backbox, audio.WinSound.SoundId)
      backbox.Frame?.Explosion?.Emit(2000)
      for (const descendent of backbox.GetDescendants()) {
        if (descendent.IsA('BasePart')) {
          descendent.Transparency = 1
        } else if (descendent.IsA('Decal')) {
          descendent.Transparency = 1
        }
      }
    }

    const barrier = arcadeTable.FindFirstChild('Barrier')
    barrier?.Destroy()

    const box = arcadeTable.FindFirstChild('Box')
    box?.Destroy()

    const pieces = findDescendentsWithTag(
      arcadeTable.FindFirstChild('Pieces'),
      BallTag,
    )
    for (const piece of pieces) piece.Destroy()

    if (backbox) {
      task.wait(2.2)
      backbox.Destroy()
    }
  }
}
