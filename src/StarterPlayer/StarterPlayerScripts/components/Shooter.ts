import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { ShooterTag } from 'ReplicatedStorage/shared/constants/tags'
import { PlayerController } from 'StarterPlayer/StarterPlayerScripts/controllers/PlayerController'

@Component({ tag: ShooterTag })
export class ShooterComponent
  extends BaseComponent<{}, Shooter>
  implements OnStart
{
  mouse: Mouse | undefined = undefined

  constructor(protected playerController: PlayerController) {
    super()
  }

  onStart() {
    this.instance.Equipped.Connect((playerMouse) => {
      this.mouse = playerMouse
      this.playerController.equipShooter(this)
      this.updateMouseIcon()
    })

    this.instance.Unequipped.Connect(() => {
      this.playerController.equipShooter(undefined)
      this.updateMouseIcon()
    })
  }

  updateMouseIcon() {
    if (this.mouse && !this.instance.Parent?.IsA('Backpack')) {
      this.mouse.Icon = 'rbxasset://textures/GunCursor.png'
    }
  }
}
