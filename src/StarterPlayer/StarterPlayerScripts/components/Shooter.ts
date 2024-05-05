import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { RunService, UserInputService } from '@rbxts/services'
import { ShooterTag } from 'ReplicatedStorage/shared/constants/tags'

@Component({ tag: ShooterTag })
export class ShooterComponent
  extends BaseComponent<{}, Shooter>
  implements OnStart
{
  mouse: Mouse | undefined = undefined
  expectingInput = false
  isMouseDown = false

  onStart() {
    this.instance.Equipped.Connect((playerMouse) => {
      this.mouse = playerMouse
      this.expectingInput = true
      this.isMouseDown = false
      this.updateMouseIcon()
    })

    this.instance.Unequipped.Connect(() => {
      this.expectingInput = false
      this.isMouseDown = false
      this.updateMouseIcon()
    })

    UserInputService.InputBegan.Connect((input, gameHandledEvent) => {
      if (gameHandledEvent || !this.expectingInput) {
        // The ExpectingInput value is used to prevent the gun from firing when it shouldn't on the clientside.
        // This will still be checked on the server.
        return
      }
      if (
        input.UserInputType === Enum.UserInputType.MouseButton1 &&
        this.mouse
      ) {
        this.isMouseDown = true
      }
    })

    UserInputService.InputEnded.Connect((input, gameHandledEvent) => {
      if (gameHandledEvent || !this.expectingInput) {
        //The ExpectingInput value is used to prevent the gun from firing when it shouldn't on the clientside.
        //This will still be checked on the server.
        return
      }
      if (
        input.UserInputType === Enum.UserInputType.MouseButton1 &&
        this.mouse
      ) {
        this.isMouseDown = false
      }
    })

    RunService.Stepped.Connect(() => {
      if (this.mouse && this.isMouseDown) {
        this.instance.MouseEvent.FireServer(this.mouse.Hit.Position)
      }
    })
  }

  updateMouseIcon() {
    if (this.mouse && !this.instance.Parent?.IsA('Backpack')) {
      this.mouse.Icon = 'rbxasset://textures/GunCursor.png'
    }
  }
}
