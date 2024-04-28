import { OnStart, Service } from '@flamework/core'
import Object from '@rbxts/object-utils'
import { Workspace } from '@rbxts/services'
import { playSoundId } from 'ReplicatedStorage/shared/assets/sounds/play-sound'
import { CURRENCY_TYPES } from 'ReplicatedStorage/shared/constants/core'
import { digitalFont } from 'ReplicatedStorage/shared/constants/digitalfont'
import {
  selectArcadeTablesState,
  selectPlayerCurrency,
  selectTycoonsState,
} from 'ReplicatedStorage/shared/state'
import {
  ArcadeTableState,
  ArcadeTableStatus,
} from 'ReplicatedStorage/shared/state/ArcadeTablesState'
import { findTycoonNameOwnedBy } from 'ReplicatedStorage/shared/state/TycoonState'
import { abbreviator } from 'ReplicatedStorage/shared/utils/currency'
import { renderGlyphs } from 'ReplicatedStorage/shared/utils/sprite'
import { Events } from 'ServerScriptService/network'
import { store } from 'ServerScriptService/store'
import { setNetworkOwner } from 'ServerScriptService/utils'

@Service()
export class ArcadeTableService implements OnStart {
  ballNumber = 1
  scoreboardCharacters = 14

  claimArcadeTable(tableName: ArcadeTableName, player?: Player) {
    if (!player) return store.claimArcadeTable(tableName, undefined)
    const state = store.getState()
    const tableCost = 1
    if (!findTycoonNameOwnedBy(selectTycoonsState()(state), player.UserId))
      return undefined
    const newState = store.addPlayerCurrency(
      player.UserId,
      CURRENCY_TYPES.Dollars,
      -tableCost,
    )
    const currencySelector = selectPlayerCurrency(
      player.UserId,
      CURRENCY_TYPES.Dollars,
    )
    if (currencySelector(newState) === currencySelector(state)) return undefined
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

  onGameWon(tableName: string, player: Player, score: number) {
    this.onGameOver(tableName, player, score)
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
}
