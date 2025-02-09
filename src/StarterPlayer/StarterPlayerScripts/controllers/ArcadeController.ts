import { Controller, OnStart } from '@flamework/core'
import { Players, UserInputService } from '@rbxts/services'
import { playSoundId } from 'ReplicatedStorage/shared/assets/sounds/play-sound'
import { USER_NAME } from 'ReplicatedStorage/shared/constants/core'
import { gameEmoticons } from 'ReplicatedStorage/shared/constants/palette'
import {
  selectArcadeTableNameOwnedBy,
  selectArcadeTableType,
  selectLocalPlayerArcadeTableStatus,
  selectLocalPlayerLoops,
} from 'ReplicatedStorage/shared/state'
import { ArcadeTableStatus } from 'ReplicatedStorage/shared/state/ArcadeTablesState'
import { mechanics } from 'ReplicatedStorage/shared/tables/mechanics'
import { findDescendentWithPath } from 'ReplicatedStorage/shared/utils/instance'
import { formatMessage, MESSAGE } from 'ReplicatedStorage/shared/utils/messages'
import { randomElement } from 'ReplicatedStorage/shared/utils/object'
import { sendAlert } from 'StarterPlayer/StarterPlayerScripts/alerts'
import { Events } from 'StarterPlayer/StarterPlayerScripts/network'
import { store } from 'StarterPlayer/StarterPlayerScripts/store'

@Controller({})
export class ArcadeController implements OnStart {
  myArcadeTableName: ArcadeTableName | undefined

  onStart() {
    const player = Players.LocalPlayer
    this.startArcadeTableControlsHandler(player)
    this.startMyArcadeTableClaimHandler(player)
    this.startMyArcadeTableLoopHandler()
    this.startMyArcadeTableMaterializeHandler()
    this.startMyArcadeTableNewPieceHandler()
    this.startMyArcadeTableWinHandler()
    this.startPlayerBounceHandler(player)
  }

  startArcadeTableControlsHandler(player: Player) {
    UserInputService.InputBegan.Connect((input, _processed) => {
      const tableName = this.myArcadeTableName
      if (!tableName || !(player.Character as PlayerCharacter)?.Humanoid?.Sit)
        return

      const tableType = store.getState(selectArcadeTableType(tableName))
      mechanics[tableType].onClientInputBegan(
        tableName,
        player.UserId,
        Events,
        input,
        UserInputService,
      )
    })
    UserInputService.InputEnded.Connect((input, _processed) => {
      const tableName = this.myArcadeTableName
      if (!tableName || !(player.Character as PlayerCharacter)?.Humanoid?.Sit)
        return

      const tableType = store.getState(selectArcadeTableType(tableName))
      mechanics[tableType].onClientInputEnded(
        tableName,
        player.UserId,
        Events,
        input,
        UserInputService,
      )
    })
  }

  startMyArcadeTableClaimHandler(player: Player) {
    // Adjust local player's camera on claim/unclaim.
    store.subscribe(
      selectArcadeTableNameOwnedBy(player.UserId),
      (arcadeTableName) => {
        this.myArcadeTableName = arcadeTableName
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
        const seat = findDescendentWithPath<Seat>(arcadeTable, [
          'Control',
          'Seat',
        ])
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

  startMyArcadeTableNewPieceHandler() {
    Events.arcadeTableNewPiece.connect((tableName, pieceType, pieceName) => {
      const tableType = store.getState(selectArcadeTableType(tableName))
      mechanics[tableType].onClientNewPiece(tableName, pieceType, pieceName)
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

  startPlayerBounceHandler(player: Player) {
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
}
