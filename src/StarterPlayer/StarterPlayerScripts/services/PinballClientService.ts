import { OnInit, Service } from '@flamework/core'
import { Players } from '@rbxts/services'
import { Events } from 'StarterPlayer/StarterPlayerScripts/network'

// import { store } from 'StarterPlayer/StarterPlayerScripts/store'

@Service()
export class PinballClientService implements OnInit {
  onInit() {
    const player = Players.LocalPlayer

    /*
    const unsubscribe = store.subscribe(
      selectPlayerState(player.UserId),
      (save) => {
        coins.Value = save?.currency.Coins ?? 0
        gems.Value = save?.currency.Gems ?? 0
      },
    )
    Players.PlayerRemoving.Connect((player) => {
      if (player === player) unsubscribe()
    })

    workspace.PinballTables.Events.NewClaim.OnClientEvent:Connect(function(pinballNa
me, ballName)
        local pinball = pinballTables:FindFirstChild(pinballName)
        if pinball == nil then
                return
        end
        local seat = pinball:FindFirstChild("Seat")
        local baseplate = pinball:FindFirstChild("Baseplate")
        if seat == nil or baseplate == nil then
                return
        end
        local camera = workspace.CurrentCamera
        local pos = seat.CFrame.Position + Vector3.new(0, 60, 0)
        local forward = baseplate.CFrame.Position - seat.CFrame.Position
        local target = baseplate.CFrame.Position - forward * .4
        local look = target - pos
        camera.CameraType = Enum.CameraType.Scriptable
        camera.CFrame = CFrame.lookAt(pos - look * .6, target)
end)

workspace.PinballTables.Events.EndClaim.OnClientEvent:Connect(function()
        local camera = workspace.CurrentCamera
        camera.CameraType = Enum.CameraType.Custom
end)%
    */

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
