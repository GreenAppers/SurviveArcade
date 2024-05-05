import { lerpBinding, useMountEffect } from '@rbxts/pretty-react-hooks'
import { composeBindings } from '@rbxts/pretty-react-hooks'
import React, { useEffect, useMemo } from '@rbxts/react'
import { useSelector, useSelectorCreator } from '@rbxts/react-reflex'
import { images, playSound, sounds } from 'ReplicatedStorage/shared/assets'
import { palette } from 'ReplicatedStorage/shared/constants/palette'
import { brightenIfDark, darken } from 'ReplicatedStorage/shared/utils/color'
import { mapStrict } from 'ReplicatedStorage/shared/utils/math'
import { fonts } from 'StarterPlayer/StarterPlayerScripts/fonts'
import { AlertTimer } from 'StarterPlayer/StarterPlayerScripts/Gui/components/AlertTimer'
import { Frame } from 'StarterPlayer/StarterPlayerScripts/Gui/components/Frame'
import { Image } from 'StarterPlayer/StarterPlayerScripts/Gui/components/Image'
import { Outline } from 'StarterPlayer/StarterPlayerScripts/Gui/components/Outline'
import { ReactiveButton } from 'StarterPlayer/StarterPlayerScripts/Gui/components/ReactiveButton'
import { Shadow } from 'StarterPlayer/StarterPlayerScripts/Gui/components/Shadow'
import { Text } from 'StarterPlayer/StarterPlayerScripts/Gui/components/Text'
import { springs } from 'StarterPlayer/StarterPlayerScripts/Gui/constants/springs'
import { useMotion, useRem } from 'StarterPlayer/StarterPlayerScripts/Gui/hooks'
import {
  dismissAlert,
  selectAlertIndex,
  selectIsMenuOpen,
} from 'StarterPlayer/StarterPlayerScripts/store'
import { Alert } from 'StarterPlayer/StarterPlayerScripts/store/AlertState'

interface AlertProps {
  readonly alert: Alert
  readonly index: number
}

const MAX_VISIBLE_ALERTS = 5
const ALERT_WIDTH = 35
const ALERT_HEIGHT = 5
const ALERT_PADDING = 2
const LIST_PADDING = 1

export function Alert({ alert, index }: AlertProps) {
  const rem = useRem()
  const menuOpen = useSelector(selectIsMenuOpen)
  const visibleIndex = useSelectorCreator(selectAlertIndex, alert.id)

  const [transition, transitionMotion] = useMotion(0)
  const [hover, hoverMotion] = useMotion(0)
  const [size, sizeMotion] = useMotion(
    new UDim2(0, ALERT_WIDTH / 2, 0, ALERT_HEIGHT / 2),
  )
  const [position, positionMotion] = useMotion(new UDim2(0.5, 0, 0, rem(5)))

  const style = useMemo(() => {
    const highlight = composeBindings(hover, transition, (a, b) =>
      typeIs(a, 'number') && typeIs(b, 'number') ? a * b : b,
    )
    const background = darken(alert.color.Lerp(palette.base, 0.25), 0.8)
    const backgroundSecondary = darken(
      alert.colorSecondary?.Lerp(palette.base, 0.25) || palette.white,
      0.8,
    )
    const message = brightenIfDark(alert.colorMessage || alert.color)

    return { highlight, background, backgroundSecondary, message }
  }, [alert, hover, transition])

  const hasGradient = alert.colorSecondary !== undefined

  const updateSize = (textWidth: number) => {
    const width = math.max(textWidth + rem(10), rem(ALERT_WIDTH))
    const height = rem(ALERT_HEIGHT)

    sizeMotion.spring(new UDim2(0, width, 0, height), springs.gentle)
  }

  useEffect(() => {
    transitionMotion.spring(alert.visible ? 1 : 0, springs.gentle)
  }, [alert.visible])

  useEffect(() => {
    const position = (ALERT_HEIGHT + LIST_PADDING) * index
    const offset = menuOpen ? 10 : 5

    positionMotion.spring(new UDim2(0.5, 0, 0, rem(position + offset)), {
      tension: 180,
      friction: 12,
      mass: mapStrict(index, 0, MAX_VISIBLE_ALERTS, 1, 2),
    })
  }, [index, menuOpen, rem])

  useEffect(() => {
    // Alerts that are dismissed are still in the list, but are invisible.
    // Do not count them towards the index of this alert to prevent it from
    // being dismissed early.
    if (visibleIndex >= MAX_VISIBLE_ALERTS) {
      dismissAlert(alert.id)
    }
  }, [visibleIndex])

  useMountEffect(() => {
    playSound(alert.sound ?? sounds.alert_neutral)
  })

  return (
    <ReactiveButton
      onClick={() => {
        dismissAlert(alert.id)
        playSound(sounds.alert_dismiss)
      }}
      onHover={(hovered) =>
        hoverMotion.spring(hovered ? 1 : 0, springs.responsive)
      }
      soundVariant="none"
      backgroundTransparency={1}
      anchorPoint={new Vector2(0.5, 0)}
      size={size}
      position={position}
    >
      <Shadow
        shadowColor={
          hasGradient
            ? palette.white
            : lerpBinding(transition, alert.color, style.background)
        }
        shadowTransparency={lerpBinding(transition, 1, 0.3)}
        shadowSize={rem(3)}
      >
        {hasGradient && (
          <uigradient
            Color={
              new ColorSequence(style.background, style.backgroundSecondary)
            }
          />
        )}
      </Shadow>

      <Frame
        backgroundColor={hasGradient ? palette.white : style.background}
        backgroundTransparency={lerpBinding(transition, 1, 0.1)}
        cornerRadius={new UDim(0, rem(1))}
        size={new UDim2(1, 0, 1, 0)}
      >
        {hasGradient && (
          <uigradient
            Color={
              new ColorSequence(style.background, style.backgroundSecondary)
            }
          />
        )}
      </Frame>

      <Frame
        backgroundColor={alert.color}
        backgroundTransparency={lerpBinding(style.highlight, 1, 0.9)}
        cornerRadius={new UDim(0, rem(1))}
        size={new UDim2(1, 0, 1, 0)}
      />

      <Outline
        innerColor={hasGradient ? palette.white : alert.color}
        innerTransparency={lerpBinding(transition, 1, 0.85)}
        outerTransparency={lerpBinding(transition, 1, 0.75)}
        cornerRadius={new UDim(0, rem(1))}
      >
        {hasGradient && (
          <uigradient
            Color={new ColorSequence(alert.color, alert.colorSecondary)}
          />
        )}
      </Outline>

      <Text
        font={fonts.inter.regular}
        text={alert.emoji}
        textColor={style.message}
        textTransparency={lerpBinding(transition, 1, 0)}
        textSize={rem(2)}
        textXAlignment="Left"
        textYAlignment="Center"
        position={new UDim2(0, rem(ALERT_PADDING), 0.5, 0)}
      />

      <Text
        richText
        font={fonts.inter.medium}
        text={alert.message}
        textColor={style.message}
        textTransparency={lerpBinding(transition, 1, 0)}
        textSize={rem(1.5)}
        textXAlignment="Left"
        textYAlignment="Center"
        anchorPoint={new Vector2(0, 0.5)}
        size={new UDim2(1, rem(-ALERT_PADDING * 2), 1, 0)}
        position={new UDim2(0, rem(ALERT_PADDING + 3), 0.5, 0)}
        clipsDescendants
        change={{
          TextBounds: (rbx) => updateSize(rbx.TextBounds.X),
        }}
      />

      <Image
        image={images.gui.alert_dismiss}
        imageColor={brightenIfDark(
          alert.colorSecondary || alert.colorMessage || alert.color,
        )}
        imageTransparency={lerpBinding(transition, 1, 0)}
        anchorPoint={new Vector2(1, 0.5)}
        size={new UDim2(0, rem(1), 0, rem(1))}
        position={new UDim2(1, rem(-ALERT_PADDING), 0.5, 0)}
      />

      <AlertTimer
        duration={alert.duration}
        color={alert.color}
        colorSecondary={alert.colorSecondary}
        transparency={lerpBinding(transition, 1, 0)}
      />
    </ReactiveButton>
  )
}
