import { Players, UserInputService } from '@rbxts/services'

const player = Players.LocalPlayer
const character = player.Character || player.CharacterAdded.Wait()[0]
const humanoid = character.WaitForChild('Humanoid') as Humanoid

function flip(player: Player, flipperName: string) {
  print('flip', player, flipperName)
  /*
	local pinball = player:FindFirstChild("PinballOwned").Value
	if pinball == nil then
		return
	end
	local flipper = pinball:FindFirstChild(flipperName)
	if flipper == nil then
		return
	end
	local flipper = flipper:FindFirstChild("Flipper")
	if flipper == nil then
		return
	end
	local rotor = flipper:FindFirstChild("Rotor")
	if rotor == nil then
		return
	end
	local orientation = 1
	if flipperName == "FlipperRight" then
		orientation = -1
	end
	rotor:ApplyAngularImpulse(rotor.CFrame.RightVector * orientation * 600000)
	workspace.PinballTables.Events.FlipFlipper:FireServer(pinball.Name, flipperName)
	*/
}

UserInputService.InputBegan.Connect((input, processed) => {
  if (humanoid.Sit) {
    if (input.UserInputType === Enum.UserInputType.Keyboard) {
      if (input.KeyCode === Enum.KeyCode.A) {
        flip(player, 'FlipperLeft')
      } else if (input.KeyCode === Enum.KeyCode.D) {
        flip(player, 'FlipperRight')
      }
    }
  }
})
