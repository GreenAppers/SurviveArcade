local pinballMachines = workspace.PinballMachines
local debouncePlayer = false

workspace.PinballMachines.NewBall.OnClientEvent:Connect(function(pinballName, ballName)
	local pinball = pinballMachines:FindFirstChild(pinballName)
	if pinball == nil then
		return
	end
	local balls = pinball:FindFirstChild("Balls")
	if balls == nil then
		return
	end
	local ball = balls:WaitForChild(ballName)
	if ball == nil then
		return
	end
	ball.Touched:Connect(function(part)
		if part.Name == "Bouncer" then
			ball:ApplyImpulse((ball.Position - part.Position) * 1000 )
		end
	end)
end)

workspace.PinballMachines.BouncePlayer.OnClientEvent:Connect(function(position)
	local player = game.Players.LocalPlayer
	local character = player.Character or player.CharacterAdded:Wait()
    local humanoid = character:FindFirstChild("HumanoidRootPart")
    if humanoid and not debouncePlayer then
		debouncePlayer = true
		humanoid:ApplyImpulse((humanoid.Position - position) * 1000 )
		task.wait(0.5)
		debouncePlayer = false
	end
end)