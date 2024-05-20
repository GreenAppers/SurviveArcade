import { OnStart, Service } from '@flamework/core'
import { Logger } from '@rbxts/log'
import Object from '@rbxts/object-utils'
import { Workspace } from '@rbxts/services'
import { playSoundId } from 'ReplicatedStorage/shared/assets/sounds/play-sound'
import { CURRENCY_TYPES } from 'ReplicatedStorage/shared/constants/core'
import { digitalFont } from 'ReplicatedStorage/shared/constants/digitalfont'
import { BallTag } from 'ReplicatedStorage/shared/constants/tags'
import {
  selectArcadeTablesState,
  selectArcadeTableState,
  selectPlayerScore,
} from 'ReplicatedStorage/shared/state'
import {
  ArcadeTableScoreDomain,
  ArcadeTableState,
  ArcadeTableStatus,
} from 'ReplicatedStorage/shared/state/ArcadeTablesState'
import { abbreviator } from 'ReplicatedStorage/shared/utils/currency'
import { renderGlyphs } from 'ReplicatedStorage/shared/utils/sprite'
import { Events } from 'ServerScriptService/network'
import { MapService } from 'ServerScriptService/services/MapService'
import { store } from 'ServerScriptService/store'
import { EXCHANGE, executeExchange } from 'ServerScriptService/utils/exchange'
import {
  findDescendentsWithTag,
  setNetworkOwner,
} from 'ServerScriptService/utils/instance'

@Service()
export class ArcadeTableService implements OnStart {
  ballNumber = 1
  scoreboardCharacters = 14

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

  claimArcadeTable(tableName: ArcadeTableName, player?: Player) {
    if (!player) return store.claimArcadeTable(tableName, undefined)
    const state = store.getState()
    const tableType = selectArcadeTableState(tableName)(state).tableType
    const exchange = EXCHANGE[tableType]
    if (!executeExchange(player.UserId, exchange)) return undefined
    store.addPlayerTablePlays(player.UserId)
    return store.claimArcadeTable(tableName, player)
  }

  startArcadeTablesClaimedSubscription() {
    store.subscribe(
      selectArcadeTablesState(),
      (arcadeTablesState, previousArcadeTablesState) => {
        for (const [tableName, arcadeTableState] of Object.entries(
          arcadeTablesState,
        )) {
          const previousArcadeTableState = previousArcadeTablesState[tableName]
          if (arcadeTableState.score !== previousArcadeTableState?.score)
            this.onScoreChanged(tableName, arcadeTableState)
          if (arcadeTableState.status === ArcadeTableStatus.Won) {
            if (
              previousArcadeTableState?.status !== ArcadeTableStatus.Won &&
              arcadeTableState.owner
            )
              this.onGameWon(
                tableName,
                arcadeTableState.owner,
                arcadeTableState.score,
              )
            continue
          }
          if (arcadeTableState.owner === previousArcadeTableState?.owner)
            continue
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
      },
    )
  }

  startArcadeTablesControlEventHandler() {
    // Play sound on flipper flip.
    Events.flipperFlip.connect((_player, tableName, flipperName) => {
      const arcadeTable = game.Workspace.ArcadeTables.FindFirstChild(tableName)
      const flipper = arcadeTable?.FindFirstChild(flipperName)
      const audio = <Folder & { FlipperSound?: Sound }>(
        arcadeTable?.FindFirstChild('Audio')
      )
      if (flipper && audio?.FlipperSound)
        playSoundId(flipper, audio.FlipperSound.SoundId)
    })
  }

  onStart() {
    this.startArcadeTablesClaimedSubscription()
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
    _player: Player,
    _tableName: string,
    _tableState: ArcadeTableState,
  ) {}

  onPlayerClaimEnded(
    player: Player,
    tableName: string,
    _tableState: ArcadeTableState,
    previousTableState: ArcadeTableState,
  ) {
    this.onGameOver(tableName, player, previousTableState.score)
  }

  onGameWon(tableName: ArcadeTableName, player: Player, score: number) {
    Promise.try(() =>
      this.playWinningSequence(game.Workspace.ArcadeTables[tableName]),
    ).then(() => {
      this.mapService.createNextTable(tableName)
      this.onGameOver(tableName, player, score)
    })
  }

  onGameOver(tableName: string, player: Player, score: number) {
    const arcadeTable = game.Workspace.ArcadeTables.FindFirstChild(tableName)
    const flipperLeft = arcadeTable?.FindFirstChild('FlipperLeft') as Flipper
    const flipperRight = arcadeTable?.FindFirstChild('FlipperRight') as Flipper
    const spinnerLeft = arcadeTable?.FindFirstChild('SpinnerLeft') as Spinner
    if (!player) {
      setNetworkOwner(flipperLeft, undefined)
      setNetworkOwner(flipperRight, undefined)
      setNetworkOwner(spinnerLeft, undefined)
      return
    }
    const payout = math.floor(score / 1000)
    if (payout >= 1)
      store.addPlayerCurrency(player.UserId, CURRENCY_TYPES.Tickets, payout)
  }

  onGameStart(tableName: string, player: Player) {
    const arcadeTable = game.Workspace.ArcadeTables.FindFirstChild(tableName)
    const balls = arcadeTable?.FindFirstChild('Balls')
    const ballTemplate = arcadeTable?.FindFirstChild('BallTemplate')
    const ground = arcadeTable?.FindFirstChild('Ground') as BasePart
    const ball = ballTemplate?.Clone() as BasePart
    if (ball) {
      this.ballNumber = this.ballNumber + 1
      ball.Name = `Ball${this.ballNumber}`
      ball.Transparency = 0
      ball.CanCollide = true
      ball.Anchored = false
      ball.Parent = balls
      const sparks = ball.FindFirstChild('Sparks') as
        | ParticleEmitter
        | undefined
      const light = ball.FindFirstChild('Light') as PointLight | undefined
      const gravity = ball.FindFirstChild('VectorForce') as
        | VectorForce
        | undefined
      if (sparks) sparks.Enabled = true
      if (light) light.Enabled = true
      if (gravity && ground) {
        gravity.Force = new Vector3(0, 1, 0)
          .sub(ground.CFrame.UpVector.Unit)
          .mul(Workspace.Gravity * ball.Mass)
      }
      setNetworkOwner(ball, player)
    }
    const flipperLeft = arcadeTable?.FindFirstChild('FlipperLeft') as Flipper
    const flipperRight = arcadeTable?.FindFirstChild('FlipperRight') as Flipper
    const spinnerLeft = arcadeTable?.FindFirstChild('SpinnerLeft') as Spinner
    setNetworkOwner(flipperLeft, player)
    setNetworkOwner(flipperRight, player)
    setNetworkOwner(spinnerLeft, player)
  }

  onScoreChanged(tableName: string, arcadeTableState: ArcadeTableState) {
    // Find the scoreboard on the arcade table.
    const arcadeTable = game.Workspace.ArcadeTables.FindFirstChild(
      tableName,
    ) as ArcadeTable
    if (!arcadeTable?.FindFirstChild('Backbox')) return
    const surfaceGuiFrame = arcadeTable.Backbox?.Scoreboard.SurfaceGui.Frame
    if (!surfaceGuiFrame) return

    // Determine the name and score to display on the scoreboard.
    const score = abbreviator.numberToString(arcadeTableState.score)
    const nameCharacters = this.scoreboardCharacters - score.size() - 1
    let name = arcadeTableState.owner?.Name || ''
    if (name.size() > nameCharacters) name = name.sub(0, nameCharacters)
    else name = name += ' '.rep(nameCharacters - name.size())
    const text = `${name} ${score}`.upper()

    // Render the text on the scoreboard.
    renderGlyphs(text, digitalFont, surfaceGuiFrame, {
      existingGlyphsLength: this.scoreboardCharacters,
      textScaled: true,
    })
  }

  async playWinningSequence(arcadeTable: ArcadeTable | undefined) {
    if (!arcadeTable) return
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
    const balls = findDescendentsWithTag(arcadeTable.Balls, BallTag)
    for (const ball of balls) ball.Destroy()
    task.wait(2.2)
    arcadeTable.Backbox?.Destroy()
  }
}
