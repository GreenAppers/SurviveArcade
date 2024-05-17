import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import React, { StrictMode } from '@rbxts/react'
import { createPortal } from '@rbxts/react-roblox'
import { VehicleSpawnerTag } from 'ReplicatedStorage/shared/constants/tags'
import { GuiController } from 'StarterPlayer/StarterPlayerScripts/controllers/GuiController'
import { App } from 'StarterPlayer/StarterPlayerScripts/Gui/pages/App'
import { RootProvider } from 'StarterPlayer/StarterPlayerScripts/Gui/providers/RootProvider'

@Component({ tag: VehicleSpawnerTag })
export class VehicleSpawnerComponent
  extends BaseComponent<{}, VehicleSpawner>
  implements OnStart
{
  constructor(protected guiController: GuiController) {
    super()
  }

  onStart() {
    print('vehicle spawner spawned')

    this.instance.Screen.Spawn.Frame.TextButton.MouseButton1Click.Connect(() =>
      this.instance.Spawn.FireServer(),
    )

    this.guiController.root.render(
      createPortal(
        <StrictMode>
          <RootProvider>
            <App />
          </RootProvider>
        </StrictMode>,
        this.instance.Screen.Spawn,
      ),
    )
  }
}
