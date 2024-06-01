import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import React, { StrictMode } from '@rbxts/react'
import { createPortal, createRoot } from '@rbxts/react-roblox'
import { VehicleSpawnerTag } from 'ReplicatedStorage/shared/constants/tags'
import { VehicleSpawner } from 'StarterPlayer/StarterPlayerScripts/Gui/components/VehicleSpawner'
import { RootProvider } from 'StarterPlayer/StarterPlayerScripts/Gui/providers/RootProvider'

@Component({ tag: VehicleSpawnerTag })
export class VehicleSpawnerComponent
  extends BaseComponent<{}, VehicleSpawner>
  implements OnStart
{
  root = createRoot(new Instance('Folder'))

  spawnVehicle() {
    this.instance.Spawn.FireServer()
  }

  onStart() {
    this.root.render(
      createPortal(
        <StrictMode>
          <RootProvider>
            <VehicleSpawner onClick={() => this.spawnVehicle()} />
          </RootProvider>
        </StrictMode>,
        this.instance.Screen.Spawn,
      ),
    )
  }
}
