import { OnStart, Service } from '@flamework/core'
import { Logger } from '@rbxts/log'
import Object from '@rbxts/object-utils'
import { Players } from '@rbxts/services'
import { playSoundId } from 'ReplicatedStorage/shared/assets/sounds'
import {
  ARCADE_TABLE_NAMES,
  NAME,
} from 'ReplicatedStorage/shared/constants/core'
import { BallTag } from 'ReplicatedStorage/shared/constants/tags'
import {
  selectArcadeTablesState,
  selectArcadeTableState,
  selectGameState,
  selectPlayerScore,
} from 'ReplicatedStorage/shared/state'
import {
  ArcadeTableScoreDomain,
  ArcadeTableStatus,
  nextArcadeTableName,
} from 'ReplicatedStorage/shared/state/ArcadeTablesState'
import { MapService } from 'ServerScriptService/services/MapService'
import { store } from 'ServerScriptService/store'
import { getDescendentsWithTag } from 'ServerScriptService/utils'

@Service()
export class GameService implements OnStart {
  constructor(
    private mapService: MapService,
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

  changeRound() {
    this.logger.Info('Changing round')
    store.startNewRound()
    store.resetArcadeTables()
    store.resetPlayerScores()
    this.mapService.loadMap('ElfMap')
  }

  onStart() {
    const gameSelector = selectGameState()
    const arcadeTablesSelector = selectArcadeTablesState()

    for (;;) {
      task.wait(1)
      const state = store.getState()
      const gameState = gameSelector(state)

      if (gameState.roundActive) {
        // Update seconds remaining until starting a new round
        const remaining =
          gameState.roundLength -
          (DateTime.now().UnixTimestamp - gameState.roundStarted.UnixTimestamp)
        if (remaining <= 0) this.changeRound()
        else store.setRoundRemaining(remaining)
      }

      const arcadeTablesState = arcadeTablesSelector(state)
      for (const [name, arcadeTableState] of Object.entries(
        arcadeTablesState,
      )) {
        if (arcadeTableState.owner) {
          // Increase players' score for each second owning an arcade table.
          const userId = arcadeTableState.owner.UserId
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
                this.handleArcadeTableWon(
                  name,
                  game.Workspace.ArcadeTables[name],
                )
            } else if (
              arcadeTableState.scoreDomain === ArcadeTableScoreDomain.Table &&
              arcadeTableState.score > arcadeTableState.scoreToWin
            ) {
              this.handleArcadeTableWon(name, game.Workspace.ArcadeTables[name])
            }
          }
        }
      }

      this.trackArcadeTablePlayZones()
    }
  }

  trackArcadeTablePlayZones() {
    const players = Players.GetPlayers().map((x) => ({
      userID: x.UserId,
      gravityUp: undefined as Vector3 | undefined,
      groundArcadeTableName: undefined as ArcadeTableName | undefined,
      groundArcadeTableSequence: undefined as number | undefined,
      humanoidRootPart: playerHumanoidRootPart(x),
    }))
    const state = store.getState()
    for (const arcadeTableName of ARCADE_TABLE_NAMES) {
      const nextTableName = nextArcadeTableName(arcadeTableName)
      const arcadeTableState = selectArcadeTableState(arcadeTableName)(state)
      const arcadeTable = game.Workspace.ArcadeTables.FindFirstChild(
        arcadeTableName,
      ) as ArcadeTable
      const nextArcadeTable = game.Workspace.ArcadeTables.FindFirstChild(
        nextTableName,
      ) as ArcadeTable
      let foundPlayerInPlayZone = false
      for (const player of players) {
        if (player.groundArcadeTableName || !player.humanoidRootPart) continue
        if (
          arcadeTable &&
          isWithinBox(arcadeTable.PlayZone, player.humanoidRootPart.Position)
        ) {
          player.gravityUp = arcadeTable.Baseplate.CFrame.UpVector
          player.groundArcadeTableName = arcadeTableName
          player.groundArcadeTableSequence = arcadeTableState?.sequence || 0
          foundPlayerInPlayZone = true
        } else if (
          nextArcadeTable &&
          isWithinBox(
            nextArcadeTable.PlayZone,
            player.humanoidRootPart.Position,
          )
        ) {
          player.gravityUp = nextArcadeTable.Baseplate.CFrame.UpVector
          player.groundArcadeTableName = arcadeTableName
          player.groundArcadeTableSequence =
            (arcadeTableState?.sequence || 0) + 1
          foundPlayerInPlayZone = true
        }
      }
      const isInitialTable =
        arcadeTableState?.status === ArcadeTableStatus.Active &&
        arcadeTableState?.sequence === 0
      if (!foundPlayerInPlayZone && !isInitialTable) {
        this.mapService.resetTable(arcadeTableName)
      }
    }
    store.updateGround(players)
  }

  handleArcadeTableWon(
    name: ArcadeTableName,
    arcadeTable: ArcadeTable | undefined,
  ) {
    store.updateArcadeTableStatus(name, ArcadeTableStatus.Won)
    if (arcadeTable) {
      if (arcadeTable.Backbox) {
        const audio = arcadeTable.FindFirstChild('Audio') as
          | { WinSound?: Sound }
          | undefined
        if (audio?.WinSound)
          playSoundId(arcadeTable.Backbox, audio.WinSound.SoundId)
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
      arcadeTable.Box.UpperWall?.Destroy()
      const balls = getDescendentsWithTag(arcadeTable.Balls, BallTag)
      for (const ball of balls) ball.Destroy()
      task.wait(2.2)
      arcadeTable.Backbox?.Destroy()
    }
    this.mapService.createNextTable(name)
  }
}

export function playerHumanoidRootPart(player: Player) {
  const character = player?.Character as PlayerCharacter | undefined
  return character?.FindFirstChild(NAME.HumanoidRootPart) as
    | BasePart
    | undefined
}

export function isWithinBox(brick: BasePart, position: Vector3) {
  const v3 = brick.CFrame.PointToObjectSpace(position)
  return (
    math.abs(v3.X) <= brick.Size.X / 2 &&
    math.abs(v3.Y) <= brick.Size.Y / 2 &&
    math.abs(v3.Z) <= brick.Size.Z / 2
  )
}
