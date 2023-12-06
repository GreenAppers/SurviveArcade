local ball = script.Parent

ball.Touched:Connect(function(part)
	local humanoid = part.Parent:FindFirstChild("Humanoid")
	if humanoid then
		humanoid.Health = 0
		return
	end
end)