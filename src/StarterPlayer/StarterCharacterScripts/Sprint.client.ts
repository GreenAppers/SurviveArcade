import { Players, UserInputService } from '@rbxts/services'

const runSpeed = 32
const walkSpeed = 16

const player = Players.LocalPlayer
const character = player.Character || player.CharacterAdded.Wait()[0]
const humanoid = character.WaitForChild('Humanoid') as Humanoid
const camera = game.Workspace.CurrentCamera

UserInputService.InputBegan.Connect((inputObject) => {
  if (inputObject.KeyCode === Enum.KeyCode.LeftShift) {
    const owned = player.FindFirstChild('PinballOwned') as ObjectValue
    if (!owned?.Value) {
      humanoid.WalkSpeed = runSpeed
      if (camera) camera.FieldOfView = 60
    }
  }
})

UserInputService.InputEnded.Connect((inputObject) => {
  if (inputObject.KeyCode === Enum.KeyCode.LeftShift) {
    humanoid.WalkSpeed = walkSpeed
    if (camera) camera.FieldOfView = 70
  }
})
