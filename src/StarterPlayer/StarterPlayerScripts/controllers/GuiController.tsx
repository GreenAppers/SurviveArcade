import { Components } from '@flamework/components'
import { Controller, Dependency, OnStart } from '@flamework/core'
import React, { StrictMode } from '@rbxts/react'
import { createPortal, createRoot } from '@rbxts/react-roblox'
import { Players } from '@rbxts/services'
import { VehicleSpawnerComponent } from 'StarterPlayer/StarterPlayerScripts/components/VehicleSpawner'
import { App } from 'StarterPlayer/StarterPlayerScripts/Gui/pages/App'
import { RootProvider } from 'StarterPlayer/StarterPlayerScripts/Gui/providers/RootProvider'

@Controller({})
export class GuiController implements OnStart {
  playerGui = Players.LocalPlayer.WaitForChild('PlayerGui')
  root = createRoot(new Instance('Folder'))

  onStart() {
    const components = Dependency<Components>()
    components.onComponentRemoved<VehicleSpawnerComponent>((vehicleSpawner) =>
      vehicleSpawner.onRemoved(),
    )

    this.root.render(
      createPortal(
        <StrictMode>
          <RootProvider>
            <App />
          </RootProvider>
        </StrictMode>,
        this.playerGui,
      ),
    )
  }
}
