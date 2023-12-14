import { OnInit, Service } from '@flamework/core'
import { Players } from '@rbxts/services'
import { selectArcadeTableNameOwnedBy } from 'ReplicatedStorage/shared/state'
import { Events } from 'StarterPlayer/StarterPlayerScripts/network'
import { store } from 'StarterPlayer/StarterPlayerScripts/store'

@Service()
export class ArcadeClientService implements OnInit {
  onInit() {
    const player = Players.LocalPlayer

    // Adjust local player's camera on claim/unclaim.
    store.subscribe(
      selectArcadeTableNameOwnedBy(player.UserId),
      (arcadeTableName) => {
        print('got change', arcadeTableName, player.UserId)
        if (arcadeTableName) {
          const arcadeTable =
            game.Workspace.ArcadeTables.FindFirstChild(arcadeTableName)
          const baseplate = arcadeTable?.FindFirstChild('Baseplate') as
            | BasePart
            | undefined
          const seat = arcadeTable?.FindFirstChild('Seat') as
            | BasePart
            | undefined
          const camera = game.Workspace.CurrentCamera
          if (camera && baseplate && seat) {
            const pos = seat.CFrame.Position.add(new Vector3(0, 60, 0))
            const forward = baseplate.CFrame.Position.sub(seat.CFrame.Position)
            const target = baseplate.CFrame.Position.sub(forward.mul(0.4))
            const look = target.sub(pos)
            camera.CameraType = Enum.CameraType.Scriptable
            camera.CFrame = new CFrame(pos.sub(look.mul(0.6)), target)
          }
        } else {
          const camera = game.Workspace.CurrentCamera
          if (camera) camera.CameraType = Enum.CameraType.Custom
        }
      },
    )

    // Local player was bounced by a Bouncer.
    let debouncePlayer = false
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
}
