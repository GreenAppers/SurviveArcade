import { OnStart, Service } from '@flamework/core'
import Object from '@rbxts/object-utils'
import { Workspace } from '@rbxts/services'
import { playSoundId } from 'ReplicatedStorage/shared/assets/sounds/play-sound'
import { digitalFont } from 'ReplicatedStorage/shared/constants/digitalfont'
import {
  selectArcadeTablesState,
  selectPlayerState,
  selectTycoonsState,
} from 'ReplicatedStorage/shared/state'
import {
  ArcadeTableState,
  ArcadeTableStatus,
} from 'ReplicatedStorage/shared/state/ArcadeTablesState'
import { findTycoonNameOwnedBy } from 'ReplicatedStorage/shared/state/TycoonState'
import { abbreviator } from 'ReplicatedStorage/shared/utils/math'
import { renderGlyphs } from 'ReplicatedStorage/shared/utils/sprite'
import { Events } from 'ServerScriptService/network'
import { store } from 'ServerScriptService/store'
import { setNetworkOwner } from 'ServerScriptService/utils'

@Service()
export class ArcadeTableService implements OnStart {
  ballNumber = 1
  scoreboardCharacters = 14

  claimArcadeTable(
    tableName: ArcadeTableName | ArcadeTableNextName,
    player?: Player,
  ) {
    if (!player) return store.claimArcadeTable(tableName, undefined)
    const state = store.getState()
    const tableCost = 1
    if (
      !findTycoonNameOwnedBy(selectTycoonsState()(state), player.UserId) ||
      (selectPlayerState(player.UserId)(state)?.dollars ?? 0) < tableCost
    )
      return undefined
    store.addDollars(player.UserId, -tableCost)
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
            this.onTableScoreChanged(tableName, arcadeTableState)
          if (
            arcadeTableState.status === ArcadeTableStatus.Won ||
            arcadeTableState.owner === previousArcadeTableState?.owner
          )
            continue
          this.onTableClaimed(tableName, arcadeTableState.owner)
          if (arcadeTableState.owner) {
            this.onPlayerClaimed(
              arcadeTableState.owner,
              tableName,
              arcadeTableState,
            )
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
    _tableName: string,
    _tableState: ArcadeTableState,
    previousTableState: ArcadeTableState,
  ) {
    const payout = math.floor(previousTableState.score / 1000)
    if (payout >= 1) store.addTickets(player.UserId, payout)
  }

  onTableClaimed(tableName: string, player?: Player) {
    const arcadeTable = game.Workspace.ArcadeTables.FindFirstChild(tableName)
    const flipperLeft = <Flipper>arcadeTable?.FindFirstChild('FlipperLeft')
    const flipperRight = <Flipper>arcadeTable?.FindFirstChild('FlipperRight')
    const spinnerLeft = <Spinner>arcadeTable?.FindFirstChild('SpinnerLeft')
    if (!player) {
      setNetworkOwner(flipperLeft, undefined)
      setNetworkOwner(flipperRight, undefined)
      setNetworkOwner(spinnerLeft, undefined)
      return
    }

    const balls = arcadeTable?.FindFirstChild('Balls')
    const ballTemplate = arcadeTable?.FindFirstChild('BallTemplate')
    const ground = <BasePart>arcadeTable?.FindFirstChild('Ground')
    const ball = <BasePart>ballTemplate?.Clone()
    if (ball) {
      this.ballNumber = this.ballNumber + 1
      ball.Name = `Ball${this.ballNumber}`
      ball.Transparency = 0
      ball.CanCollide = true
      ball.Anchored = false
      ball.Parent = balls
      const sparks = <ParticleEmitter | undefined>ball.FindFirstChild('Sparks')
      const light = <PointLight | undefined>ball.FindFirstChild('Light')
      const gravity = <VectorForce | undefined>(
        ball.FindFirstChild('VectorForce')
      )
      if (sparks) sparks.Enabled = true
      if (light) light.Enabled = true
      if (gravity && ground) {
        gravity.Force = new Vector3(0, 1, 0)
          .sub(ground.CFrame.UpVector.Unit)
          .mul(Workspace.Gravity * ball.Mass)
      }
      setNetworkOwner(ball, player)
    }
    setNetworkOwner(flipperLeft, player)
    setNetworkOwner(flipperRight, player)
    setNetworkOwner(spinnerLeft, player)
  }

  onTableScoreChanged(tableName: string, arcadeTableState: ArcadeTableState) {
    // print('score state')
    // print(store.getState().arcadeTables)
    // Find the scoreboard on the arcade table.
    const arcadeTable = game.Workspace.ArcadeTables.FindFirstChild(
      tableName,
    ) as ArcadeTable
    if (!arcadeTable?.Backbox) return
    const surfaceGuiFrame = arcadeTable.Backbox.Scoreboard.SurfaceGui.Frame
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
