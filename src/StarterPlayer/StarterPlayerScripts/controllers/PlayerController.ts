import { Controller, OnStart } from '@flamework/core'
import { Players, UserInputService } from '@rbxts/services'
import { selectLocalPlayerState } from 'ReplicatedStorage/shared/state'
import {
  GravityController,
  getGravityControllerUp,
  gravityControllerClass,
} from 'ReplicatedStorage/shared/utils/gravity'
import { ArcadeController } from 'StarterPlayer/StarterPlayerScripts/controllers/ArcadeController'
import { store } from 'StarterPlayer/StarterPlayerScripts/store'
import { forEveryPlayerCharacterAdded } from '../utils'

@Controller({})
export class PlayerController implements OnStart {
  gravityController: GravityController | undefined
  isEquipped = false
  isSeated = false

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

    const player = Players.LocalPlayer
    forEveryPlayerCharacterAdded(player, (character) => {
      this.disableGravityController()
      //this.enableGravityController()
      const humanoid = <Humanoid>character.WaitForChild('Humanoid')
      humanoid?.Seated?.Connect((seated) => {
        this.isSeated = seated
        if (seated) this.disableGravityController()
        else this.enableGravityController()
      })
      /* humanoid?.Climbing?.Connect((climbing) => {
        if (climbing) this.disableGravityController()
        else this.enableGravityController()
      }) */
    })
  }

  disableGravityController() {
    if (!this.gravityController) return
    print('disableGravityController')
    this.gravityController.Destroy()
    this.gravityController = undefined
  }

  enableGravityController() {
    if (this.gravityController) return
    const gravityController = new gravityControllerClass(Players.LocalPlayer)
    const localPlayerStateSelector = selectLocalPlayerState()
    // gravityController.GetGravityUp = getGravityControllerUp
    gravityController.GetGravityUp = (_, oldGravityUp) => {
      const localPlayerState = localPlayerStateSelector(store.getState())
      return localPlayerState?.gravityUp || oldGravityUp
    }
    this.gravityController = gravityController
    print(
      'enableGravityController',
      gravityController.GetGravityUp(gravityController, new Vector3(0, 1, 0)),
    )
  }
}
