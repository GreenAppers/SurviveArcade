import { ReplicatedStorage, Workspace } from '@rbxts/services'
import { getDescendentsWhichAre } from 'ServerScriptService/utils'

const arcadeTables = Workspace.ArcadeTables
// const newClaimEvent = arcadeTables.Events.NewClaim
// const endClaimEvent = arcadeTables.Events.EndClaim
// const newBallEvent = arcadeTables.Events.NewBall
// let ballNumber = 0

function setupPinball(
  pinball: Model & { Baseplate: BasePart },
  color: BrickColor,
  statorColor: BrickColor,
  baseColor: BrickColor,
  baseMaterial: Enum.Material,
) {
  const parts = getDescendentsWhichAre(pinball, 'BasePart') as BasePart[]
  for (const part of parts) {
    if (part.Name === 'BallTemplate') continue

    if (part.Name === 'Stator') {
      part.BrickColor = statorColor
    } else if (part.Name === 'Baseplate') {
      pinball.PrimaryPart = part
    } else if (string.match(part.Name, '^Floor*')[0]) {
      part.BrickColor = baseColor
      part.Material = baseMaterial
    } else {
      part.BrickColor = color
    }
  }
  pinball.Baseplate.BrickColor = baseColor
  pinball.Baseplate.Material = baseMaterial
}

/*
arcadeTables.Events.Claim.Event:Connect(function(player, pinball, claimed)
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

arcadeTables.Events.FlipFlipper.OnServerEvent:Connect(function(player, pinballName, flipperName)
	local pinball = arcadeTables:FindFirstChild(pinballName)
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
*/

const pinballTemplate = ReplicatedStorage.ArcadeTables.Pinball1
const pinballPos = new Vector3(192.306, 29.057, -0)

const pinball1 = pinballTemplate.Clone()
pinball1.Name = 'Table1'
setupPinball(
  pinball1,
  new BrickColor('Cyan'),
  new BrickColor('Electric blue'),
  new BrickColor('Pastel Blue'),
  Enum.Material.Glass,
)
pinball1.PivotTo(
  new CFrame(new Vector3(pinballPos.X, pinballPos.Y, pinballPos.Z)).mul(
    CFrame.fromOrientation(math.rad(15), math.rad(-90), math.rad(0)),
  ),
)
pinball1.Values.TeamName.Value = 'Blue Team'
pinball1.Parent = arcadeTables

const pinball2 = pinballTemplate.Clone()
pinball2.Name = 'Table2'
setupPinball(
  pinball2,
  new BrickColor('Lime green'),
  new BrickColor('Forest green'),
  new BrickColor('Sand green'),
  Enum.Material.Glass,
)
pinball2.PivotTo(
  new CFrame(new Vector3(pinballPos.Z, pinballPos.Y, pinballPos.X)).mul(
    CFrame.fromOrientation(math.rad(15), math.rad(180), math.rad(0)),
  ),
)
pinball2.Values.TeamName.Value = 'Green Team'
pinball2.Parent = arcadeTables

const pinball3 = pinballTemplate.Clone()
pinball3.Name = 'Table3'
setupPinball(
  pinball3,
  new BrickColor('Deep orange'),
  new BrickColor('Neon orange'),
  new BrickColor('Cork'),
  Enum.Material.Glass,
)
pinball3.PivotTo(
  new CFrame(new Vector3(-pinballPos.X, pinballPos.Y, pinballPos.Z)).mul(
    CFrame.fromOrientation(math.rad(15), math.rad(90), math.rad(0)),
  ),
)
pinball3.Values.TeamName.Value = 'Yellow Team'
pinball3.Parent = arcadeTables

const pinball4 = pinballTemplate.Clone()
pinball4.Name = 'Table4'
setupPinball(
  pinball4,
  new BrickColor('Really red'),
  new BrickColor('Crimson'),
  new BrickColor('Terra Cotta'),
  Enum.Material.Glass,
)
pinball4.PivotTo(
  new CFrame(new Vector3(-pinballPos.Z, pinballPos.Y, -pinballPos.X)).mul(
    CFrame.fromOrientation(math.rad(15), math.rad(0), math.rad(0)),
  ),
)
pinball4.Values.TeamName.Value = 'Red Team'
pinball4.Parent = arcadeTables
