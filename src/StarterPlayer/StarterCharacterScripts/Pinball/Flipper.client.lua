local player = game.Players.LocalPlayer
local character = player.Character or player.CharacterAdded:Wait()
local humanoid = character:WaitForChild("Humanoid")
local UserInputService = game:GetService("UserInputService")

function flip(player, flipperName)	
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
	workspace.PinballMachines.FlipFlipper:FireServer(pinball.Name, flipperName)
end

UserInputService.InputBegan:Connect(function(input, processed)
	if humanoid.Sit == true then
		if input.UserInputType == Enum.UserInputType.Keyboard then
			if input.KeyCode == Enum.KeyCode.A then
				flip(player, "FlipperLeft")
			elseif input.KeyCode == Enum.KeyCode.D then
				flip(player, "FlipperRight")
			end
		end
	end
end)
