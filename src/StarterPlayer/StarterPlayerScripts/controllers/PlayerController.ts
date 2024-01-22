import { Controller, OnStart } from '@flamework/core'
import { Players, UserInputService } from '@rbxts/services'
import {
  selectLocalPlayerGroundArcadeTableName,
  selectLocalPlayerState,
} from 'ReplicatedStorage/shared/state'
import {
  GravityController,
  gravityControllerClass,
} from 'ReplicatedStorage/shared/utils/gravity'
import { ArcadeController } from 'StarterPlayer/StarterPlayerScripts/controllers/ArcadeController'
import { store } from 'StarterPlayer/StarterPlayerScripts/store'
import { forEveryPlayerCharacterAdded } from 'StarterPlayer/StarterPlayerScripts/utils'

@Controller({})
export class PlayerController implements OnStart {
  gravityController: GravityController | undefined
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
      const humanoid = <Humanoid>character.WaitForChild('Humanoid')
      humanoid?.Seated?.Connect((seated) => {
        this.isSeated = seated
        if (seated) this.disableGravityController()
        else this.enableGravityController()
      })
    })

    store.subscribe(
      selectLocalPlayerGroundArcadeTableName(),
      (groudArcadeTableName) => {
        if (!groudArcadeTableName) this.disableGravityController()
      },
    )
  }

  disableGravityController() {
    if (!this.gravityController) return
    this.gravityController.Destroy()
    this.gravityController = undefined
  }

  enableGravityController() {
    if (this.gravityController) return
    const gravityController = new gravityControllerClass(Players.LocalPlayer)
    const localPlayerStateSelector = selectLocalPlayerState()
    gravityController.GetGravityUp = (_, oldGravityUp) => {
      const localPlayerState = localPlayerStateSelector(store.getState())
      return localPlayerState?.gravityUp || oldGravityUp
    }
    this.gravityController = gravityController
  }
}
