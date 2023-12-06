local seat = script.Parent
local utils = require(game.ServerScriptService.Utils)
local pinball = utils.getParentPinball(seat)
local values = pinball:FindFirstChild("Values")

seat:GetPropertyChangedSignal("Occupant"):Connect(function()
	if seat.Occupant == nil then
		if values.OwnerValue.Value == nil then
			return
		end
		local player = values.OwnerValue.Value
		values.OwnerValue.Value = nil
		player:FindFirstChild("PinballOwned").Value = nil
		player.Team = game:GetService("Teams")["Unclaimed Team"]
		pinball.Parent.Events.Claim:Fire(player, pinball, false)
		local leaderstats = player:FindFirstChild("leaderstats")
		if leaderstats ~= nil then
			local score = leaderstats:FindFirstChild("Score")
			if score ~= nil then
				score.Value = 0
			end
		end
		return
	end
	if values.OwnerValue.Value ~= nil then
		return
	end
	local character = seat.Occupant.Parent
	local player = game.Players:GetPlayerFromCharacter(character)
	if player and player:FindFirstChild("PinballOwned").Value == nil then
		values.OwnerValue.Value = player
		--mainItems.OwnerDoor.Title.SurfaceGui.TextLabel.Text = tostring(values.OwnerValue.Value).."'s Tycoon"
		player:FindFirstChild("PinballOwned").Value = pinball
		player.Team = game:GetService("Teams")[values.TeamName.Value]
		pinball.Parent.Events.Claim:Fire(player, pinball, true)
	end	
end)