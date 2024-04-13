import { Controller, OnStart } from '@flamework/core'
import { Players, UserInputService } from '@rbxts/services'
import { playSoundId } from 'ReplicatedStorage/shared/assets/sounds/play-sound'
import { USER_NAME } from 'ReplicatedStorage/shared/constants/core'
import {
  selectArcadeTableNameOwnedBy,
  selectLocalPlayerArcadeTableStatus,
  selectLocalPlayerLoops,
} from 'ReplicatedStorage/shared/state'
import {
  ArcadeTablesState,
  ArcadeTableStatus,
} from 'ReplicatedStorage/shared/state/ArcadeTablesState'
import {
  nearestArcadeTable,
  nearestCabinet,
  nearestCabinetTruss,
} from 'ReplicatedStorage/shared/utils/arcade'
import { sendAlert } from 'StarterPlayer/StarterPlayerScripts/alerts'
import { Events } from 'StarterPlayer/StarterPlayerScripts/network'
import { store } from 'StarterPlayer/StarterPlayerScripts/store'

@Controller({})
export class ArcadeController implements OnStart {
  fullForceKeypress = 0
  myArcadeTableName = ''

  onStart() {
    const player = Players.LocalPlayer
    this.startArcadeTableControlsHandler(player)
    this.startMyArcadeTableBounceHandler(player)
    this.startMyArcadeTableClaimHandler(player)
    this.startMyArcadeTableMaterializeHandler()
    this.startMyArcadeTableLoopHandler()
    this.startMyArcadeTableWinHandler()
  }

  startArcadeTableControlsHandler(player: Player) {
    UserInputService.InputBegan.Connect((input, _processed) => {
      if (input.UserInputType === Enum.UserInputType.Keyboard) {
        let flip = ''
        if (input.KeyCode === Enum.KeyCode.A) flip = 'FlipperLeft'
        else if (input.KeyCode === Enum.KeyCode.D) flip = 'FlipperRight'
        if (flip) {
          let force = 1
          if (this.fullForceKeypress) {
            const startTick = tick()
            let keyHeldDownFor = 0
            while (
              keyHeldDownFor < this.fullForceKeypress &&
              UserInputService.IsKeyDown(input.KeyCode)
            ) {
              keyHeldDownFor = tick() - startTick
              task.wait()
            }
            force = math.max(1, keyHeldDownFor / this.fullForceKeypress)
          }
          this.flipFlipper(player, flip, force)
        }
      }
    })
  }

  startMyArcadeTableBounceHandler(player: Player) {
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

  startMyArcadeTableClaimHandler(player: Player) {
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
          emoji: '🏁',
          message: `Score ${aracdeTableState?.scoreToWin} to win.`,
        })
        const arcadeTable =
          game.Workspace.ArcadeTables.FindFirstChild(arcadeTableName)
        const baseplate = arcadeTable?.FindFirstChild('Baseplate') as
          | BasePart
          | undefined
        const ground = arcadeTable?.FindFirstChild('Ground') as
          | BasePart
          | undefined
        const seat = arcadeTable?.FindFirstChild('Seat') as BasePart | undefined
        const camera = game.Workspace.CurrentCamera
        if (camera && baseplate && seat) {
          const up = ground?.CFrame.UpVector.Unit || new Vector3(0, 1, 0)
          const pos = seat.CFrame.Position.add(up.mul(60))
          const forward = baseplate.CFrame.Position.sub(seat.CFrame.Position)
          const target = baseplate.CFrame.Position.sub(forward.mul(0.4)).add(
            up.mul(20),
          )
          const look = target.sub(pos)
          camera.CameraType = Enum.CameraType.Scriptable
          camera.CFrame = CFrame.lookAt(pos.sub(look), target, up)
        }
      },
    )
  }

  startMyArcadeTableMaterializeHandler() {
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

  startMyArcadeTableLoopHandler() {
    store.subscribe(selectLocalPlayerLoops(), () => {
      sendAlert({
        emoji: '🔄',
        message: `${USER_NAME} looped!`,
      })
    })
  }

  startMyArcadeTableWinHandler() {
    store.subscribe(
      selectLocalPlayerArcadeTableStatus(),
      (arcadeTableStatus) => {
        if (arcadeTableStatus !== ArcadeTableStatus.Won) return
        sendAlert({
          emoji: '🏆',
          message: `You defeated the barrier!  Now you can ascend the stairs!`,
        })
      },
    )
  }

  flipFlipper(player: Player, flipperName: string, force: number) {
    if (!(<PlayerCharacter>player.Character)?.Humanoid?.Sit) return
    // print('flip', flipperName, force)
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
      rotor.CFrame.RightVector.mul(orientation * 600000 * force),
    )
    Events.flipperFlip.fire(arcadeTable.Name, flipperName)
  }

  refreshBeams(arcadeTablesState: ArcadeTablesState, guideEnabled?: boolean) {
    const localPlayer = Players.LocalPlayer
    const playerCharacter = <PlayerCharacter | undefined>localPlayer?.Character
    const beam = playerCharacter?.FindFirstChild('Beam') as Beam | undefined
    const humanoid = <Humanoid | undefined>(
      playerCharacter?.FindFirstChild('Humanoid')
    )
    if (!playerCharacter || !humanoid || !beam) return

    // Clear old beam
    beam.Enabled = false

    // Check if player is alive and has guide enabled.
    if (!guideEnabled || !humanoid.Health || humanoid.Sit) return
    const localPlayerTeamName =
      localPlayer?.Team?.Name === 'Unclaimed Team'
        ? undefined
        : localPlayer?.Team?.Name

    // Find the local player's RootRigAttachment.
    const humanoidRootPart = <BasePart | undefined>(
      playerCharacter.FindFirstChild('HumanoidRootPart')
    )
    if (!playerCharacter || !humanoidRootPart) return
    const rootRigAttachment = <Attachment | undefined>(
      humanoidRootPart.FindFirstChild('RootRigAttachment')
    )
    if (!rootRigAttachment) return

    let targetAttachment
    if (rootRigAttachment.WorldPosition.Y < 10) {
      // Find nearest Cabinet
      const arcadeTableName = nearestCabinet(
        humanoidRootPart.Position,
        arcadeTablesState,
        localPlayerTeamName,
      )
      if (!arcadeTableName) return
      // Find nearest truss
      const trussName = nearestCabinetTruss(
        humanoidRootPart.Position,
        arcadeTableName,
      )
      targetAttachment =
        game.Workspace.Map[arcadeTableName]?.[trussName]?.Attachment
    } else {
      // Find nearest Arcade Table
      const arcadeTableName = nearestArcadeTable(
        humanoidRootPart.Position,
        arcadeTablesState,
        localPlayerTeamName,
      )
      if (!arcadeTableName) return
      targetAttachment =
        game.Workspace.ArcadeTables[arcadeTableName]?.Seat?.Attachment
    }

    if (!targetAttachment) return
    beam.Attachment0 = rootRigAttachment
    beam.Attachment1 = targetAttachment
    beam.Enabled = true
  }
}
