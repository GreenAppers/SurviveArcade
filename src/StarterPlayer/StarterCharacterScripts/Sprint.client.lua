local player = game.Players.LocalPlayer
local character = player.Character or player.CharacterAdded:Wait()
local humanoid = character:WaitForChild("Humanoid")
local UserInputService = game:GetService("UserInputService")
local camera = game.Workspace.CurrentCamera
local runSpeed = 32
local walkSpeed = 16

game:GetService("UserInputService").InputBegan:Connect(function(inputObject)
	if inputObject.KeyCode == Enum.KeyCode.LeftShift then
		local owned = player:FindFirstChild("PinballOwned")
		if owned == nil or owned.Value == nil then
		    humanoid.WalkSpeed = runSpeed
			camera.FieldOfView = 60
		end
	end
end)

game:GetService("UserInputService").InputEnded:Connect(function(inputObject)
	if inputObject.KeyCode == Enum.KeyCode.LeftShift then
		humanoid.WalkSpeed = walkSpeed
		camera.FieldOfView = 70
	end
end)
