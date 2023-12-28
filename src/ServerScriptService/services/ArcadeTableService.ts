import { OnStart, Service } from '@flamework/core'
import Object from '@rbxts/object-utils'
import { Teams } from '@rbxts/services'
import { playSoundId } from 'ReplicatedStorage/shared/assets/sounds/play-sound'
import { selectArcadeTablesState } from 'ReplicatedStorage/shared/state'
import {
  ArcadeTableState,
  ArcadeTableStatus,
} from 'ReplicatedStorage/shared/state/ArcadeTablesState'
import { Events } from 'ServerScriptService/network'
import { store } from 'ServerScriptService/store'
import { setNetworkOwner } from 'ServerScriptService/utils'

@Service()
export class ArcadeTableService implements OnStart {
  ballNumber = 1

  startArcadeTablesClaimedSubscription() {
    store.subscribe(
      selectArcadeTablesState(),
      (arcadeTablesState, previousArcadeTablesState) => {
        for (const [tableName, arcadeTableState] of Object.entries(
          arcadeTablesState,
        )) {
          const previousArcadeTableState = previousArcadeTablesState[tableName]
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
            this.onPlayerClaimed(previousArcadeTableState.owner)
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
    player: Player,
    tableName?: string,
    tableState?: ArcadeTableState,
  ) {
    player.Team = Teams[tableState?.teamName || 'Unclaimed Team']
    if (!tableName) {
      player.Team = Teams['Unclaimed Team']
      store.resetScore(player.UserId)
      return
    }
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
      if (sparks) sparks.Enabled = true
      if (light) light.Enabled = true
      setNetworkOwner(ball, player)
    }
    setNetworkOwner(flipperLeft, player)
    setNetworkOwner(flipperRight, player)
    setNetworkOwner(spinnerLeft, player)
  }
}
