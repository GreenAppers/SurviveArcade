import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import React, { StrictMode } from '@rbxts/react'
import { createPortal, createRoot } from '@rbxts/react-roblox'
import { VehicleSpawnerTag } from 'ReplicatedStorage/shared/constants/tags'
import { FlySafe } from 'StarterPlayer/StarterPlayerScripts/Gui/components/FlySafe'
import { ReactiveButton } from 'StarterPlayer/StarterPlayerScripts/Gui/components/ReactiveButton'
import { Text } from 'StarterPlayer/StarterPlayerScripts/Gui/components/Text'
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
            <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
              <ReactiveButton
                backgroundColor={Color3.fromRGB(0, 0, 0)}
                backgroundTransparency={0.5}
                position={new UDim2(0, 0, 0.4, 0)}
                size={new UDim2(1, 0, 0.2, 0)}
                onClick={() => this.spawnVehicle()}
              >
                <Text
                  backgroundTransparency={1}
                  position={new UDim2(0, 0, 0, 0)}
                  size={new UDim2(1, 0, 1, 0)}
                  text={'Spawn Plane'}
                  textColor={Color3.fromRGB(255, 255, 255)}
                  textSize={14}
                  textScaled={true}
                />
              </ReactiveButton>
              <FlySafe />
            </frame>
          </RootProvider>
        </StrictMode>,
        this.instance.Screen.Spawn,
      ),
    )
  }
}
