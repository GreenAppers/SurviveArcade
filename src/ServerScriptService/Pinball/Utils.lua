local utils = {}

function utils.getDescendentsWhichAre(ancestor, className)
	assert(typeof(ancestor) == "Instance")
	assert(typeof(className) == "string")
	local descendents = {}
	for _, descendent in pairs(ancestor:GetDescendants()) do
		if descendent:IsA(className) then
			table.insert(descendents, descendent)
		end
	end
	return descendents
end

function utils.isPinball(pinball)
	if string.match(pinball.Name, "^Pinball[0-9]+$") then
		return true
	end
	return false
end

function utils.getParentPinball(instance)
	while instance.Parent do
		if instance.Parent.name == "PinballMachines" then
			return instance			
		end
		instance = instance.Parent
	end
	return instance
end

function utils.getPinballOwner(pinball)
	local values = pinball:FindFirstChild("Values")
	if values == nil then
		return nil
	end
	local value = values:FindFirstChild("OwnerValue")
	if value == nil then
		return nil
	end
	local player = value.Value
	return player
end

function utils.addScore(player, incrementValue)
	local leaderstats = player:FindFirstChild("leaderstats")
	if leaderstats == nil then
		return
	end
	local score = leaderstats:FindFirstChild("Score")
	if score == nil then
		return
	end
	score.Value += incrementValue
	local high = leaderstats:FindFirstChild("High")
	if high == nil then
		return
	end
	if score.Value > high.Value then
		high.Value = score.Value
	end
end

function utils.playSound(object, soundId)
	local sound = object:FindFirstChild("Sound") 
	if sound then
		sound:Play()
		return
	else
		sound = Instance.new("Sound", object)
		sound.SoundId = soundId
		sound:Play()
	end
end

return utils
