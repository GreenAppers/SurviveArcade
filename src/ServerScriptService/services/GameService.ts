import { OnStart, Service } from '@flamework/core'
import { Logger } from '@rbxts/log'
import {
  ARCADE_TABLE_NAMES,
  CHARACTER_CHILD,
} from 'ReplicatedStorage/shared/constants/core'
import {
  selectArcadeTableState,
  selectGameState,
} from 'ReplicatedStorage/shared/state'
import {
  ArcadeTableStatus,
  nextArcadeTableName,
} from 'ReplicatedStorage/shared/state/ArcadeTablesState'
import { MapService } from 'ServerScriptService/services/MapService'
import { store } from 'ServerScriptService/store'
import { getPlayers } from 'ServerScriptService/utils/player'

@Service()
export class GameService implements OnStart {
  constructor(
    private mapService: MapService,
    private readonly logger: Logger,
  ) {}

  changeRound() {
    this.logger.Info('Changing round')
    store.startNewRound()
    store.resetArcadeTables()
    store.resetPlayerScores()
    this.mapService.loadMap('ElfMap')
  }

  onStart() {
    const gameSelector = selectGameState()

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

      this.updatePlayersGravity()
    }
  }

  updatePlayersGravity() {
    const players = getPlayers().map((x) => ({
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
      const arcadeTable =
        game.Workspace.ArcadeTables.FindFirstChild<ArcadeTable>(arcadeTableName)
      const nextArcadeTable =
        game.Workspace.ArcadeTables.FindFirstChild<ArcadeTable>(nextTableName)
      let foundPlayerInPlayZone = false
      for (const player of players) {
        if (player.groundArcadeTableName || !player.humanoidRootPart) continue
        if (
          arcadeTable &&
          isWithinBox(arcadeTable.PlayZone, player.humanoidRootPart.Position)
        ) {
          player.gravityUp = (
            arcadeTable.FindFirstChild<BasePart>('Baseplate') ??
            arcadeTable.Ground
          ).CFrame.UpVector
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
          player.gravityUp = (
            nextArcadeTable.FindFirstChild<BasePart>('Baseplate') ??
            nextArcadeTable.Ground
          ).CFrame.UpVector
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
        this.logger.Info(`No player in ${arcadeTableName} play zone`)
        this.mapService.resetTable(arcadeTableName)
      }
    }
    store.updateGround(players)
  }
}

export function playerHumanoidRootPart(player: { Character?: Model }) {
  const character = player?.Character as PlayerCharacter | undefined
  return character?.FindFirstChild<BasePart>(CHARACTER_CHILD.HumanoidRootPart)
}

export function isWithinBox(brick: BasePart, position: Vector3) {
  const v3 = brick.CFrame.PointToObjectSpace(position)
  return (
    math.abs(v3.X) <= brick.Size.X / 2 &&
    math.abs(v3.Y) <= brick.Size.Y / 2 &&
    math.abs(v3.Z) <= brick.Size.Z / 2
  )
}
