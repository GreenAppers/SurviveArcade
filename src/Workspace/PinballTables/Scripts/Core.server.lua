local pinballTables = script.Parent.Parent
local newClaimEvent = pinballTables.Events.NewClaim
local endClaimEvent = pinballTables.Events.EndClaim
local newBallEvent = pinballTables.Events.NewBall
local utils = require(game.ServerScriptService.Utils)
local ballNumber = 0

function setupPinball(pinball, color, statorColor, baseColor, baseMaterial)
	local parts = utils.getDescendentsWhichAre(pinball, "BasePart")
	for _, part in pairs(parts) do
		if part.name == "BallTemplate" then
			local script = game.ReplicatedStorage.Scripts.Ball:Clone()
			script.Parent = part
			continue
		end
		if part.name == "Stator" then
			part.BrickColor = statorColor
		elseif part.name == "Baseplate" then
			pinball.PrimaryPart = part
		elseif string.match(part.name, "^Floor*") then
			part.BrickColor = baseColor
			part.Material = baseMaterial
		else
			part.BrickColor = color
		end
		if part.Name == "Bouncer" then
			local script = game.ReplicatedStorage.Scripts.Bouncer:Clone()
			script.Parent = part
		elseif part.Name == "Seat" then
			local script = game.ReplicatedStorage.Scripts.Seat:Clone()
			script.Parent = part
		elseif string.match(part.name, "Drain$") then
			local script = game.ReplicatedStorage.Scripts.Drain:Clone()
			script.Parent = part
		elseif string.match(part.name, "Scorer[0-9]+$") then
			local script = game.ReplicatedStorage.Scripts.Scorer:Clone()
			script.Parent = part
		end
	end
	pinball.Baseplate.BrickColor = baseColor
	pinball.Baseplate.Material = baseMaterial
end

pinballTables.Events.Claim.Event:Connect(function(player, pinball, claimed)
	local flipperLeft = pinball:FindFirstChild("FlipperLeft")
	local flipperRight = pinball:FindFirstChild("FlipperRight")
	local spinnerLeft = pinball:FindFirstChild("SpinnerLeft")
	if not claimed then
		flipperLeft.Flipper.Rotor:SetNetworkOwner(nil)
		flipperRight.Flipper.Rotor:SetNetworkOwner(nil)
		spinnerLeft.Spinner.Spinner:SetNetworkOwner(nil)
		endClaimEvent:FireClient(player)
		return
	end

	ballNumber = ballNumber + 1
	local balls = pinball:FindFirstChild("Balls")
	local ballTemplate = pinball:FindFirstChild("BallTemplate")
	local ball = ballTemplate:Clone()
	ball.Name = "Ball" .. tostring(ballNumber)
	ball.Transparency = 0
	ball.CanCollide = true
	ball.Anchored = false
	ball.Parent = balls
	ball:SetNetworkOwner(player)
	flipperLeft.Flipper.Rotor:SetNetworkOwner(player)
	flipperRight.Flipper.Rotor:SetNetworkOwner(player)
	spinnerLeft.Spinner.Spinner:SetNetworkOwner(player)
	newClaimEvent:FireClient(player, pinball.Name)
	newBallEvent:FireClient(player, pinball.Name, ball.Name)
end)

pinballTables.Events.FlipFlipper.OnServerEvent:Connect(function(player, pinballName, flipperName)
	local pinball = pinballTables:FindFirstChild(pinballName)
	if pinball == nil then
		return
	end
	local flipper = pinball:FindFirstChild(flipperName)
	if flipper == nil then
		return
	end
	local audio = pinball:FindFirstChild("Audio")
	if audio ~= nil then
		utils.playSound(flipper, audio.FlipperSound.SoundId)
	end
end)

local pinballTemplate = game.ReplicatedStorage.PinballTables.Level1
local pinballPos = Vector3.new(192.306, 29.057, -0)

local pinball1 = pinballTemplate:Clone()
pinball1.Name = "Pinball1"
setupPinball(
	pinball1,
	BrickColor.new("Cyan"),
	BrickColor.new("Electric blue"),
	BrickColor.new("Pastel Blue"),
	Enum.Material.Glass
)
pinball1:SetPrimaryPartCFrame(
	CFrame.new(Vector3.new(pinballPos.X, pinballPos.Y, pinballPos.Z))
		* CFrame.fromOrientation(math.rad(15), math.rad(-90), math.rad(0))
)
pinball1.Values:WaitForChild("PinballColor").Value = BrickColor.new("Cyan")
pinball1.Values:WaitForChild("TeamName").Value = "Blue Team"
pinball1.Parent = pinballTables

local pinball2 = pinballTemplate:Clone()
pinball2.Name = "Pinball2"
setupPinball(
	pinball2,
	BrickColor.new("Lime green"),
	BrickColor.new("Forest green"),
	BrickColor.new("Sand green"),
	Enum.Material.Glass
)
pinball2:SetPrimaryPartCFrame(
	CFrame.new(Vector3.new(pinballPos.Z, pinballPos.Y, pinballPos.X))
		* CFrame.fromOrientation(math.rad(15), math.rad(180), math.rad(0))
)
pinball2.Values:WaitForChild("PinballColor").Value = BrickColor.new("Lime green")
pinball2.Values:WaitForChild("TeamName").Value = "Green Team"
pinball2.Parent = pinballTables

local pinball3 = pinballTemplate:Clone()
pinball3.Name = "Pinball3"
setupPinball(
	pinball3,
	BrickColor.new("Deep orange"),
	BrickColor.new("Neon orange"),
	BrickColor.new("Cork"),
	Enum.Material.Glass
)
pinball3:SetPrimaryPartCFrame(
	CFrame.new(Vector3.new(-pinballPos.X, pinballPos.Y, pinballPos.Z))
		* CFrame.fromOrientation(math.rad(15), math.rad(90), math.rad(0))
)
pinball3.Values:WaitForChild("PinballColor").Value = BrickColor.new("Deep orange")
pinball3.Values:WaitForChild("TeamName").Value = "Yellow Team"
pinball3.Parent = pinballTables

local pinball4 = pinballTemplate:Clone()
pinball4.Name = "Pinball4"
setupPinball(
	pinball4,
	BrickColor.new("Really red"),
	BrickColor.new("Crimson"),
	BrickColor.new("Terra Cotta"),
	Enum.Material.Glass
)
pinball4:SetPrimaryPartCFrame(
	CFrame.new(Vector3.new(-pinballPos.Z, pinballPos.Y, -pinballPos.X))
		* CFrame.fromOrientation(math.rad(15), math.rad(0), math.rad(0))
)
pinball4.Values:WaitForChild("PinballColor").Value = BrickColor.new("Really red")
pinball4.Values:WaitForChild("TeamName").Value = "Red Team"
pinball4.Parent = pinballTables
