local drain = script.Parent
local utils = require(game.ServerScriptService.Utils)
local pinball = utils.getParentPinball(drain)
local values = pinball:FindFirstChild("Values")

drain.Touched:Connect(function(part)
	if part.Parent.Name ~= "Balls" then
		return
	end
	if values.OwnerValue.Value ~= nil then
		local player = values.OwnerValue.Value
		player.Character.Humanoid.Health = 0
		local leaderstats = player:FindFirstChild("leaderstats")
		if leaderstats ~= nil then
			local score = leaderstats:FindFirstChild("Score")
			if score ~= nil then
				score.Value = 0
			end
		end
	end
	task.wait(0.5)
	part:Destroy()
end)