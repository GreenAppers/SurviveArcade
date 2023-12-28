import { Controller, OnStart } from '@flamework/core'
import Object from '@rbxts/object-utils'
import { Players, UserInputService } from '@rbxts/services'
import {
  selectArcadeTableNameOwnedBy,
  selectArcadeTablesState,
  selectLocalPlayerArcadeTableStatus,
  selectPlayerGuideEnabled,
} from 'ReplicatedStorage/shared/state'
import {
  ArcadeTablesState,
  ArcadeTableStatus,
} from 'ReplicatedStorage/shared/state/ArcadeTablesState'
import { sendAlert } from 'StarterPlayer/StarterPlayerScripts/alerts'
import { Events } from 'StarterPlayer/StarterPlayerScripts/network'
import { store } from 'StarterPlayer/StarterPlayerScripts/store'

@Controller({})
export class ArcadeController implements OnStart {
  myArcadeTableName = ''

  startArcadeTableControlsHandler(player: Player) {
    UserInputService.InputBegan.Connect((input, _processed) => {
      if (input.UserInputType === Enum.UserInputType.Keyboard) {
        if (input.KeyCode === Enum.KeyCode.A) {
          this.flipFlipper(player, 'FlipperLeft')
        } else if (input.KeyCode === Enum.KeyCode.D) {
          this.flipFlipper(player, 'FlipperRight')
        }
      }
    })
  }

  startMyBounceHandler(player: Player) {
    let debouncePlayer = false
    // Local player was bounced by a Bouncer.
    Events.playerBounce.connect((position) => {
      const humanoid = (<PlayerCharacter>player.Character).Humanoid
      const rootPart = humanoid?.RootPart
      if (rootPart && !debouncePlayer) {
        debouncePlayer = true
        rootPart.ApplyImpulse(rootPart.Position.sub(position).mul(1000))
        task.wait(0.5)
        debouncePlayer = false
      }
    })
  }

  startMyClaimHandler(player: Player) {
    // Adjust local player's camera on claim/unclaim.
    store.subscribe(
      selectArcadeTableNameOwnedBy(player.UserId),
      (arcadeTableName) => {
        this.myArcadeTableName = arcadeTableName || ''
        if (!arcadeTableName) {
          const camera = game.Workspace.CurrentCamera
          if (camera) camera.CameraType = Enum.CameraType.Custom
          return
        }
        const aracdeTableState = store.getState().arcadeTables[arcadeTableName]
        if (aracdeTableState?.status !== ArcadeTableStatus.Active) return
        sendAlert({
          message: `Score ${aracdeTableState?.scoreToWin} to win.`,
        })
        const arcadeTable =
          game.Workspace.ArcadeTables.FindFirstChild(arcadeTableName)
        const baseplate = arcadeTable?.FindFirstChild('Baseplate') as
          | BasePart
          | undefined
        const seat = arcadeTable?.FindFirstChild('Seat') as BasePart | undefined
        const camera = game.Workspace.CurrentCamera
        if (camera && baseplate && seat) {
          const pos = seat.CFrame.Position.add(new Vector3(0, 60, 0))
          const forward = baseplate.CFrame.Position.sub(seat.CFrame.Position)
          const target = baseplate.CFrame.Position.sub(forward.mul(0.4)).add(
            new Vector3(0, 20, 0),
          )
          const look = target.sub(pos)
          camera.CameraType = Enum.CameraType.Scriptable
          camera.CFrame = new CFrame(pos.sub(look), target)
        }
      },
    )
  }

  startMyWinHandler() {
    store.subscribe(
      selectLocalPlayerArcadeTableStatus(),
      (arcadeTableStatus) => {
        if (arcadeTableStatus !== ArcadeTableStatus.Won) return
        sendAlert({
          message: `You defeated the barrier!  Now you can ascend the stairs!`,
        })
      },
    )
  }

  startMyRespawnHandler(player: Player) {
    const aracdeTablesSelector = selectArcadeTablesState()
    const playerGuideEnabledSelector = selectPlayerGuideEnabled(player.UserId)
    player.CharacterAdded.Connect(() => {
      sendAlert({ message: 'Get the high score.  But beware of the rats!' })
      const state = store.getState()
      this.refreshBeams(
        aracdeTablesSelector(state),
        playerGuideEnabledSelector(state),
      )
    })
  }

  startMyGuideHandler(player: Player) {
    const arcadeTablesSelector = selectArcadeTablesState()
    const playerGuideEnabledSelector = selectPlayerGuideEnabled(player.UserId)
    store.subscribe(arcadeTablesSelector, (arcadeTablesState) => {
      this.refreshBeams(
        arcadeTablesState,
        playerGuideEnabledSelector(store.getState()),
      )
    })
    store.subscribe(playerGuideEnabledSelector, (guideEnabled) => {
      this.refreshBeams(arcadeTablesSelector(store.getState()), guideEnabled)
    })
  }

  onStart() {
    const player = Players.LocalPlayer
    this.startArcadeTableControlsHandler(player)
    this.startMyBounceHandler(player)
    this.startMyClaimHandler(player)
    this.startMyRespawnHandler(player)
    this.startMyGuideHandler(player)
    this.startMyWinHandler()
  }

  flipFlipper(player: Player, flipperName: string) {
    if (!(<PlayerCharacter>player.Character)?.Humanoid?.Sit) return
    const arcadeTable = game.Workspace.ArcadeTables.FindFirstChild(
      this.myArcadeTableName,
    )
    if (!arcadeTable) return
    const flipperModel = arcadeTable.FindFirstChild(flipperName)
    const flipper = flipperModel?.FindFirstChild('Flipper')
    const rotor = <BasePart>flipper?.FindFirstChild('Rotor')
    if (!rotor) return
    const orientation = flipperName === 'FlipperRight' ? -1 : 1
    rotor.ApplyAngularImpulse(
      rotor.CFrame.RightVector.mul(orientation * 600000),
    )
    Events.flipperFlip.fire(arcadeTable.Name, flipperName)
  }

  refreshBeams(arcadeTablesState: ArcadeTablesState, guideEnabled?: boolean) {
    const localPlayer = Players.LocalPlayer
    const playerCharacter = <PlayerCharacter | undefined>localPlayer?.Character
    if (!playerCharacter) return

    // Clear old beams
    for (const instance of playerCharacter.GetChildren()) {
      if (instance.IsA('Beam')) instance.Destroy()
    }

    // Check if player has guide enabled.
    if (!guideEnabled) return

    // Find the local player's RootRigAttachment.
    const humanoidRootPart = playerCharacter.WaitForChild('HumanoidRootPart')
    if (!playerCharacter || !humanoidRootPart) return
    const rootRigAttachment = <Attachment | undefined>(
      humanoidRootPart.FindFirstChild('RootRigAttachment')
    )
    if (!rootRigAttachment) return

    // Create new beams
    for (const [aracdeTableName, aracdeTableState] of Object.entries(
      arcadeTablesState,
    )) {
      if (aracdeTableState?.status !== ArcadeTableStatus.Active) continue
      const seatAttachment =
        game.Workspace.ArcadeTables[aracdeTableName]?.Seat?.Attachment
      if (!seatAttachment) continue
      const beam = new Instance('Beam')
      beam.Name = 'Beam'
      beam.Attachment0 = rootRigAttachment
      beam.Attachment1 = seatAttachment
      beam.Parent = playerCharacter
    }
  }
}
