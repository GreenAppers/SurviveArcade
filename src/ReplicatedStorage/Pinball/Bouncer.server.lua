local part = script.Parent
local utils = require(game.ServerScriptService.Pinball.Utils)
local pinball = utils.getParentPinball(part)

part.Touched:Connect(function(hit)
	part.Material = Enum.Material.Neon
	local player = utils.getPinballOwner(pinball)
	if player ~= nil then
		utils.addScore(player, 1000)
	end
	local audio = pinball:FindFirstChild("Audio")
	if audio ~= nil then
		utils.playSound(part, audio.BouncerSound.SoundId)
	end
	if hit.Parent:FindFirstChild("Humanoid") then
		local touchedPlayer = game.Players:GetPlayerFromCharacter(hit.Parent)		
		workspace.PinballMachines.BouncePlayer:FireClient(touchedPlayer, part.Position)
	end
	task.wait(0.5)
	part.Material = Enum.Material.Plastic
end)
