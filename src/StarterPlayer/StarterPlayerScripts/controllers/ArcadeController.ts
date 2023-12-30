import { Controller, OnStart } from '@flamework/core'
import { Players, UserInputService } from '@rbxts/services'
import { playSoundId } from 'ReplicatedStorage/shared/assets/sounds/play-sound'
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
import { nearestArcadeTable } from 'ReplicatedStorage/shared/utils/arcade'
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

  startMyMaterializeHandler() {
    let debounce = false
    Events.arcadeTableMaterialize.connect((arcadeTableName) => {
      const arcadeTable = game.Workspace.ArcadeTables[arcadeTableName]
      if (arcadeTable && !debounce) {
        debounce = true
        const audio = <Folder & { MaterializeSound?: Sound }>(
          arcadeTable?.FindFirstChild('Audio')
        )
        if (audio?.MaterializeSound)
          playSoundId(arcadeTable, audio.MaterializeSound.SoundId)
        task.wait(0.5)
        debounce = false
      }
    })
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
    this.startMyMaterializeHandler()
    this.startMyRespawnHandler(player)
    this.startMyGuideHandler(player)
    this.startMyWinHandler()

    const arcadeTablesSelector = selectArcadeTablesState()
    const playerGuideEnabledSelector = selectPlayerGuideEnabled(player.UserId)
    while (task.wait(1)) {
      const state = store.getState()
      this.refreshBeams(
        arcadeTablesSelector(state),
        playerGuideEnabledSelector(state),
      )
    }
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
    const humanoid = playerCharacter?.Humanoid
    if (!playerCharacter || !humanoid) return

    // Clear old beams
    for (const instance of playerCharacter.GetChildren()) {
      if (instance.IsA('Beam')) instance.Destroy()
    }

    // Check if player is alive and has guide enabled.
    if (!guideEnabled || !humanoid.Health || humanoid.Sit) return

    // Find the local player's RootRigAttachment.
    const humanoidRootPart = <BasePart | undefined>(
      playerCharacter.WaitForChild('HumanoidRootPart')
    )
    if (!playerCharacter || !humanoidRootPart) return
    const rootRigAttachment = <Attachment | undefined>(
      humanoidRootPart.FindFirstChild('RootRigAttachment')
    )
    if (!rootRigAttachment) return

    // Find nearest Arcade Table
    const arcadeTableName = nearestArcadeTable(
      humanoidRootPart.Position,
      arcadeTablesState,
      localPlayer?.Team?.Name === 'Unclaimed Team'
        ? undefined
        : localPlayer?.Team?.Name,
    )
    if (!arcadeTableName) return

    // Create new beam
    const seatAttachment =
      game.Workspace.ArcadeTables[arcadeTableName]?.Seat?.Attachment
    if (!seatAttachment) return
    const beam = new Instance('Beam')
    beam.Name = 'Beam'
    beam.Texture = 'rbxassetid://956427083'
    beam.TextureMode = Enum.TextureMode.Wrap
    beam.TextureLength = 3
    beam.TextureSpeed = 4
    beam.FaceCamera = true
    beam.Transparency = new NumberSequence(0.1)
    beam.Width0 = 1.5
    beam.Width1 = 1.5
    beam.Attachment0 = rootRigAttachment
    beam.Attachment1 = seatAttachment
    beam.Parent = playerCharacter
  }
}
