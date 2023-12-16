import { Controller, OnStart } from '@flamework/core'
import { Players, UserInputService } from '@rbxts/services'
import { ArcadeController } from 'StarterPlayer/StarterPlayerScripts/controllers/ArcadeController'

@Controller({})
export class PlayerController implements OnStart {
  constructor(private arcadeController: ArcadeController) {}

  onStart() {
    const runSpeed = 32
    const walkSpeed = 16

    UserInputService.InputBegan.Connect((inputObject) => {
      if (inputObject.KeyCode === Enum.KeyCode.LeftShift) {
        const player = Players.LocalPlayer
        const humanoid = (<PlayerCharacter>player.Character)?.Humanoid
        const camera = game.Workspace.CurrentCamera
        if (!this.arcadeController.myArcadeTableName) {
          if (humanoid) humanoid.WalkSpeed = runSpeed
          if (camera) camera.FieldOfView = 60
        }
      }
    })

    UserInputService.InputEnded.Connect((inputObject) => {
      if (inputObject.KeyCode === Enum.KeyCode.LeftShift) {
        const player = Players.LocalPlayer
        const humanoid = (<PlayerCharacter>player.Character)?.Humanoid
        const camera = game.Workspace.CurrentCamera
        if (humanoid) humanoid.WalkSpeed = walkSpeed
        if (camera) camera.FieldOfView = 70
      }
    })
  }
}
