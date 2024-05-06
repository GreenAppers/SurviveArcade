import { lerpBinding, useEventListener } from '@rbxts/pretty-react-hooks'
import React, { useBinding } from '@rbxts/react'
import { RunService } from '@rbxts/services'
import { palette } from 'ReplicatedStorage/shared/constants/palette'
import { darken } from 'ReplicatedStorage/shared/utils/color'
import { CanvasGroup } from 'StarterPlayer/StarterPlayerScripts/Gui/components/CanvasGroup'
import { Frame } from 'StarterPlayer/StarterPlayerScripts/Gui/components/Frame'
import { useRem } from 'StarterPlayer/StarterPlayerScripts/Gui/hooks'

interface AlertTimerProps {
  readonly duration: number
  readonly color: Color3
  readonly colorSecondary?: Color3
  readonly transparency: React.Binding<number>
}

export function AlertTimer({
  duration,
  color,
  colorSecondary = color,
  transparency,
}: AlertTimerProps) {
  const rem = useRem()
  const [progress, setProgress] = useBinding(0)

  const colorFrom = darken(color, 0.2)
  const colorTo = darken(colorSecondary, 0.2)

  useEventListener(RunService.Heartbeat, (deltaTime) => {
    setProgress(math.clamp(progress.getValue() + deltaTime / duration, 0, 1))
  })

  return (
    <CanvasGroup
      backgroundTransparency={1}
      cornerRadius={new UDim(0, rem(1))}
      size={new UDim2(1, 0, 1, 0)}
    >
      <uigradient Color={new ColorSequence(colorFrom, colorTo)} />

      <Frame
        backgroundColor={palette.white}
        backgroundTransparency={transparency}
        anchorPoint={new Vector2(0, 1)}
        size={lerpBinding(
          progress,
          new UDim2(1, 0, 0, rem(0.35)),
          new UDim2(0, 0, 0, rem(0.35)),
        )}
        position={new UDim2(0, 0, 1, 0)}
      />
    </CanvasGroup>
  )
}
