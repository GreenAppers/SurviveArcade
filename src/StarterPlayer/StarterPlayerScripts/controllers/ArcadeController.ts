import { Controller, OnStart } from '@flamework/core'
import { Players, UserInputService } from '@rbxts/services'
import { playSoundId } from 'ReplicatedStorage/shared/assets/sounds/play-sound'
import { USER_NAME } from 'ReplicatedStorage/shared/constants/core'
import { gameEmoticons } from 'ReplicatedStorage/shared/constants/palette'
import {
  selectArcadeTableNameOwnedBy,
  selectLocalPlayerArcadeTableStatus,
  selectLocalPlayerLoops,
} from 'ReplicatedStorage/shared/state'
import { ArcadeTableStatus } from 'ReplicatedStorage/shared/state/ArcadeTablesState'
import { formatMessage, MESSAGE } from 'ReplicatedStorage/shared/utils/messages'
import { randomElement } from 'ReplicatedStorage/shared/utils/object'
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
      const humanoid = (player.Character as PlayerCharacter).Humanoid
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
          emoji: randomElement(gameEmoticons),
          message: formatMessage(MESSAGE.ArcadeTableStart, {
            scoreToWin: aracdeTableState?.scoreToWin || 0,
          }),
        })
        const arcadeTable =
          game.Workspace.ArcadeTables.FindFirstChild(arcadeTableName)
        const baseplate = arcadeTable?.FindFirstChild<BasePart>('Baseplate')
        const ground = arcadeTable?.FindFirstChild<BasePart>('Ground')
        const seat = arcadeTable?.FindFirstChild<BasePart>('Seat')
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
        const audio = arcadeTable?.FindFirstChild<
          Folder & { MaterializeSound?: Sound }
        >('Audio')
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
        message: formatMessage(MESSAGE.ArcadeTableLooped, {
          playerName: USER_NAME,
        }),
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
          message: formatMessage(MESSAGE.ArcadeTableWon),
        })
      },
    )
  }

  flipFlipper(player: Player, flipperName: string, force: number) {
    if (!(player.Character as PlayerCharacter)?.Humanoid?.Sit) return
    // print('flip', flipperName, force)
    const arcadeTable = game.Workspace.ArcadeTables.FindFirstChild(
      this.myArcadeTableName,
    )
    if (!arcadeTable) return
    const flipperModel = arcadeTable.FindFirstChild(flipperName)
    const flipper = flipperModel?.FindFirstChild('Flipper')
    const rotor = flipper?.FindFirstChild<BasePart>('Rotor')
    if (!rotor) return
    const orientation = flipperName === 'FlipperRight' ? -1 : 1
    rotor.ApplyAngularImpulse(
      rotor.CFrame.RightVector.mul(orientation * 600000 * force),
    )
    Events.flipperFlip.fire(arcadeTable.Name, flipperName)
  }
}
