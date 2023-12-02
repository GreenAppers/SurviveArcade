local pinballs = game.Workspace.PinballMachines
local utils = require(game.ServerScriptService.Pinball.Utils)

while true do
	task.wait(1)
	for _, pinball in pairs(pinballs:GetChildren()) do
		if utils.isPinball(pinball) == false then
			continue
		end
		local player = utils.getPinballOwner(pinball)
		if player == nil then
			continue
		end
		utils.addScore(player, 10)
	end
end
