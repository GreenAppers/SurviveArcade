game.Players.PlayerAdded:Connect(function(player)
	local pinballOwned = Instance.new("ObjectValue")
	pinballOwned.Name = "PinballOwned"
	pinballOwned.Parent = player

	local leaderstats = Instance.new("Folder")
	leaderstats.Name = "leaderstats"
	leaderstats.Parent = player
	
	local score = Instance.new("IntValue")
	score.Name = "Score"
	score.Value = 0
	score.Parent = leaderstats
	
	local highScore = Instance.new("IntValue")
	highScore.Name = "High"
	highScore.Value = 0
	highScore.Parent = leaderstats
end)
