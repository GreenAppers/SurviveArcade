game.Players.PlayerAdded:Connect(function(player)
	local pinballOwned = Instance.new("ObjectValue", player)
	pinballOwned.Name = "PinballOwned"

	local leaderstats = Instance.new("Folder", player)
	leaderstats.Name = "leaderstats"
	
	local score = Instance.new("IntValue", leaderstats)
	score.Name = "Score"
	score.Value = 0
	
	local highScore = Instance.new("IntValue", leaderstats)
	highScore.Name = "High"
	highScore.Value = 0
end)
