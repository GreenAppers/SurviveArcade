import { Controller, OnStart } from '@flamework/core'
import { Players, UserInputService } from '@rbxts/services'
import { selectArcadeTableNameOwnedBy } from 'ReplicatedStorage/shared/state'
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
      const character = player.Character || player.CharacterAdded.Wait()[0]
      const humanoid = character.FindFirstChild('HumanoidRootPart') as BasePart
      if (humanoid && !debouncePlayer) {
        debouncePlayer = true
        humanoid.ApplyImpulse(humanoid.Position.sub(position).Unit.mul(1000))
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
          const target = baseplate.CFrame.Position.sub(forward.mul(0.4))
          const look = target.sub(pos)
          camera.CameraType = Enum.CameraType.Scriptable
          camera.CFrame = new CFrame(pos.sub(look.mul(0.6)), target)
        }
      },
    )
  }

  onStart() {
    const player = Players.LocalPlayer
    this.startArcadeTableControlsHandler(player)
    this.startMyBounceHandler(player)
    this.startMyClaimHandler(player)
  }

  flipFlipper(player: Player, flipperName: string) {
    if (!(<PlayerCharacter>player.Character)?.Humanoid?.Sit) return
    print("flip", player, flipperName, this.myArcadeTableName)
    const arcadeTable = game.Workspace.ArcadeTables.FindFirstChild(
      this.myArcadeTableName,
    )
    if (!arcadeTable) return
    print("got table", arcadeTable)
    const flipperModel = arcadeTable.FindFirstChild(flipperName)
    const flipper = flipperModel?.FindFirstChild('Flipper')
    const rotor = <BasePart>flipper?.FindFirstChild('Rotor')
    if (!rotor) return
    print("got rotor", rotor)
    const orientation = flipperName === 'FlipperRight' ? -1 : 1
    rotor.ApplyAngularImpulse(
      rotor.CFrame.RightVector.mul(orientation * 600000),
    )
    Events.flipperFlip.fire(arcadeTable.Name, flipperName)
  }
}