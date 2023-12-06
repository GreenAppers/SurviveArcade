local pinballTables = workspace.PinballTables

workspace.PinballTables.Events.NewClaim.OnClientEvent:Connect(function(pinballName, ballName)
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
end)