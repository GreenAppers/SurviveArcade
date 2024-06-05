import { blend, lerpBinding, useUpdateEffect } from '@rbxts/pretty-react-hooks'
import { composeBindings } from '@rbxts/pretty-react-hooks'
import React, { useEffect, useState } from '@rbxts/react'
import {
  ButtonSoundVariant,
  playButtonDown,
  playButtonUp,
  playSound,
  sounds,
} from 'ReplicatedStorage/shared/assets'
import { palette } from 'ReplicatedStorage/shared/constants/palette'
import { Button } from 'StarterPlayer/StarterPlayerScripts/Gui/components/Button'
import { Frame } from 'StarterPlayer/StarterPlayerScripts/Gui/components/Frame'
import { useMotion, useRem } from 'StarterPlayer/StarterPlayerScripts/Gui/hooks'
import { useButtonAnimation } from 'StarterPlayer/StarterPlayerScripts/Gui/hooks/useButtonAnimation'
import { useButtonState } from 'StarterPlayer/StarterPlayerScripts/Gui/hooks/useButtonState'

interface ReactiveButtonProps extends React.PropsWithChildren {
  onClick?: () => void
  onMouseDown?: () => void
  onMouseUp?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onHover?: (hovered: boolean) => void
  onPress?: (pressed: boolean) => void
  enabled?: boolean
  size?: UDim2 | React.Binding<UDim2>
  position?: UDim2 | React.Binding<UDim2>
  anchorPoint?: Vector2 | React.Binding<Vector2>
  backgroundColor?: Color3 | React.Binding<Color3>
  backgroundTransparency?: number | React.Binding<number>
  cornerRadius?: UDim | React.Binding<UDim>
  layoutOrder?: number | React.Binding<number>
  animatePosition?: boolean
  animatePositionStrength?: number
  animatePositionDirection?: Vector2
  animateSize?: boolean
  animateSizeStrength?: number
  animateWhenChanged?: string
  soundVariant?: ButtonSoundVariant
  zIndex?: number | React.Binding<number>
  event?: React.InstanceEvent<TextButton>
  change?: React.InstanceChangeEvent<TextButton>
}

export function ReactiveButton({
  onClick,
  onMouseDown,
  onMouseUp,
  onMouseEnter,
  onMouseLeave,
  onHover,
  onPress,
  enabled = true,
  size,
  position,
  anchorPoint,
  backgroundColor = palette.white,
  backgroundTransparency = 0,
  cornerRadius,
  layoutOrder,
  zIndex,
  animatePosition = true,
  animatePositionStrength = 1,
  animatePositionDirection = new Vector2(0, 1),
  animateWhenChanged,
  animateSize = true,
  animateSizeStrength = 1,
  soundVariant = 'default',
  event = {},
  change = {},
  children,
}: ReactiveButtonProps) {
  const rem = useRem()
  const [sizeAnimation, sizeMotion] = useMotion(0)
  const [press, hover, buttonEvents] = useButtonState()
  const [lastAnimateWhenChanged, setLastAnimateWhenChanged] =
    useState(animateWhenChanged)
  const animation = useButtonAnimation(
    press || animateWhenChanged !== lastAnimateWhenChanged,
    hover,
  )

  useEffect(() => {
    if (animateWhenChanged !== lastAnimateWhenChanged) {
      setLastAnimateWhenChanged(animateWhenChanged)
      playSound(sounds.update, { volume: 0.25 })
    }
  }, [animateWhenChanged])

  useUpdateEffect(() => {
    if (press) {
      sizeMotion.spring(-0.1, { tension: 300 })
    } else {
      sizeMotion.spring(0, { impulse: 0.01, tension: 300 })
    }
  }, [press])

  useUpdateEffect(() => {
    onHover?.(hover)
  }, [hover])

  useUpdateEffect(() => {
    onPress?.(press)
  }, [press])

  return (
    <Button
      onClick={enabled ? onClick : undefined}
      active={enabled}
      onMouseDown={() => {
        if (!enabled) return
        buttonEvents.onMouseDown()
        onMouseDown?.()
        playButtonDown(soundVariant)
      }}
      onMouseUp={() => {
        if (!enabled) return
        buttonEvents.onMouseUp()
        onMouseUp?.()
        playButtonUp(soundVariant)
      }}
      onMouseEnter={() => {
        buttonEvents.onMouseEnter()
        onMouseEnter?.()
      }}
      onMouseLeave={() => {
        buttonEvents.onMouseLeave()
        onMouseLeave?.()
      }}
      backgroundTransparency={1}
      size={size}
      position={position}
      anchorPoint={anchorPoint}
      layoutOrder={layoutOrder}
      zIndex={zIndex}
      event={event}
      change={change}
    >
      <Frame
        backgroundColor={composeBindings(
          animation.hoverOnly,
          animation.press,
          backgroundColor,
          (hover, press, color) => {
            return color
              .Lerp(new Color3(1, 1, 1), hover * 0.15)
              .Lerp(new Color3(), press * 0.1)
          },
        )}
        backgroundTransparency={composeBindings(
          animation.press,
          backgroundTransparency,
          (press, transparency) => {
            return blend(-press * 0.2, transparency)
          },
        )}
        cornerRadius={cornerRadius}
        anchorPoint={new Vector2(0.5, 0.5)}
        size={lerpBinding(
          animateSize ? sizeAnimation : 0,
          new UDim2(1, 0, 1, 0),
          new UDim2(
            1,
            rem(2 * animateSizeStrength),
            1,
            rem(2 * animateSizeStrength),
          ),
        )}
        position={lerpBinding(
          animatePosition ? animation.position : 0,
          new UDim2(0.5, 0, 0.5, 0),
          new UDim2(
            0.5,
            (3 + rem(0.1)) *
              animatePositionStrength *
              animatePositionDirection.X,
            0.5,
            (3 + rem(0.1)) *
              animatePositionStrength *
              animatePositionDirection.Y,
          ),
        )}
      >
        {children}
      </Frame>
    </Button>
  )
}
