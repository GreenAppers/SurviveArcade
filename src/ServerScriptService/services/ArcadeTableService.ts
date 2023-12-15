import { OnStart, Service } from '@flamework/core'
import Object from '@rbxts/object-utils'
import { Teams } from '@rbxts/services'
import { selectArcadeTablesState } from 'ReplicatedStorage/shared/state'
import { Events } from 'ServerScriptService/network'
import { store } from 'ServerScriptService/store'
import { playSound } from 'ServerScriptService/utils'

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
            arcadeTableState.owner === previousArcadeTableState?.owner ||
            !typeIs(tableName, 'string')
          )
            continue
          this.onTableClaimed(tableName, arcadeTableState.owner)
          if (arcadeTableState.owner) {
            this.onPlayerClaimed(arcadeTableState.owner, tableName)
          } else if (previousArcadeTableState?.owner) {
            this.onPlayerClaimed(previousArcadeTableState.owner, tableName)
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
        playSound(flipper, audio.FlipperSound.SoundId)
    })
  }

  onStart() {
    this.startArcadeTablesClaimedSubscription()
    this.startArcadeTablesControlEventHandler()

    // Increase players' score for each second owning an arcade table.
    const arcadeTablesSelector = selectArcadeTablesState()
    for (;;) {
      task.wait(1)
      const arcadeTablesState = arcadeTablesSelector(store.getState())
      for (const arcadeTableState of Object.values(arcadeTablesState)) {
        if (arcadeTableState.owner)
          store.addScore(arcadeTableState.owner.UserId, 10)
      }
    }
  }

  onPlayerClaimed(player: Player, tableName?: string) {
    if (!tableName) {
      player.Team = Teams['Unclaimed Team']
      store.resetScore(player.UserId)
      return
    }
    // mainItems.OwnerDoor.Title.SurfaceGui.TextLabel.Text = tostring(values.OwnerValue.Value).."'s Tycoon"
    // player.Team = Teams[values.TeamName.Value]
  }

  onTableClaimed(tableName: string, player?: Player) {
    const arcadeTable = game.Workspace.ArcadeTables.FindFirstChild(tableName)
    const flipperLeft = <Flipper>arcadeTable?.FindFirstChild('FlipperLeft')
    const flipperRight = <Flipper>arcadeTable?.FindFirstChild('FlipperRight')
    const spinnerLeft = <Spinner>arcadeTable?.FindFirstChild('SpinnerLeft')
    if (!player) {
      flipperLeft.Flipper.Rotor.SetNetworkOwner(undefined)
      flipperRight.Flipper.Rotor.SetNetworkOwner(undefined)
      spinnerLeft.Spinner.Spinner.SetNetworkOwner(undefined)
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
      ball.SetNetworkOwner(player)
    }
    flipperLeft.Flipper.Rotor.SetNetworkOwner(player)
    flipperRight.Flipper.Rotor.SetNetworkOwner(player)
    spinnerLeft.Spinner.Spinner.SetNetworkOwner(player)
    //newClaimEvent:FireClient(player, pinball.Name)
    //newBallEvent:FireClient(player, pinball.Name, ball.Name)
  }
}
