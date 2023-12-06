local part = script.Parent
local utils = require(game.ServerScriptService.Utils)
local pinball = utils.getParentPinball(part)

part.Touched:Connect(function(hit)
	part.Material = Enum.Material.Neon
	local player = utils.getPinballOwner(pinball)
	if player ~= nil then
		utils.addScore(player, 1000)
	end
	local audio = pinball:FindFirstChild("Audio")
	if audio ~= nil then
		utils.playSound(part, audio.ScorerSound.SoundId)
	end
	task.wait(0.5)
	part.Material = Enum.Material.Plastic
end)