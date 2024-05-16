import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { SwordTag } from 'ReplicatedStorage/shared/constants/tags'

@Component({ tag: SwordTag })
export class SwordComponent
  extends BaseComponent<{}, Sword>
  implements OnStart
{
  mouse: Mouse | undefined = undefined

  onStart() {
    this.instance.Equipped.Connect((playerMouse) => {
      this.mouse = playerMouse
      this.mouse.Icon = 'rbxasset://textures/GunCursor.png'
    })

    this.instance.GetPropertyChangedSignal('Enabled').Connect(() => {
      if (this.mouse) this.mouse.Icon = 'rbxasset://textures/GunWaitCursor.png'
    })
  }
}
