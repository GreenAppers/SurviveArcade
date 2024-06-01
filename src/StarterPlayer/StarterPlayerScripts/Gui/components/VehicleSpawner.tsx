import React from '@rbxts/react'
import { ReactiveButton } from 'StarterPlayer/StarterPlayerScripts/Gui/components/ReactiveButton'
import { Text } from 'StarterPlayer/StarterPlayerScripts/Gui/components/Text'

export const VehicleSpawner = (props: { onClick?: () => void }) => (
  <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
    <ReactiveButton
      backgroundColor={Color3.fromRGB(0, 0, 0)}
      backgroundTransparency={0.5}
      position={new UDim2(0, 0, 0.4, 0)}
      size={new UDim2(1, 0, 0.2, 0)}
      onClick={props.onClick}
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
    <textlabel
      BackgroundColor3={Color3.fromRGB(82, 198, 242)}
      BackgroundTransparency={0.5}
      Position={new UDim2(0, 0, 0.8, 0)}
      Size={new UDim2(1, 0, 0.2, 0)}
      Text={'Fly Safe!'}
      TextColor3={Color3.fromRGB(255, 255, 255)}
      TextScaled={true}
      TextSize={14}
    />
  </frame>
)
