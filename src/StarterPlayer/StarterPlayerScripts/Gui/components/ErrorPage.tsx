import Roact, { useEffect } from '@rbxts/roact'
import { TeleportService } from '@rbxts/services'
import { playSound, sounds } from 'ReplicatedStorage/shared/assets'
import { palette } from 'ReplicatedStorage/shared/constants/palette'
import { Frame } from 'StarterPlayer/StarterPlayerScripts/Gui/components/Frame'
import { Group } from 'StarterPlayer/StarterPlayerScripts/Gui/components/Group'
import { Layer } from 'StarterPlayer/StarterPlayerScripts/Gui/components/Layer'
import { PrimaryButton } from 'StarterPlayer/StarterPlayerScripts/Gui/components/PrimaryButton'
import { Text } from 'StarterPlayer/StarterPlayerScripts/Gui/components/Text'
import { TextField } from 'StarterPlayer/StarterPlayerScripts/Gui/components/TextField'
import { fonts } from 'StarterPlayer/StarterPlayerScripts/Gui/constants/fonts'
import { useRem } from 'StarterPlayer/StarterPlayerScripts/Gui/hooks'

interface ErrorPageProps {
  readonly message: unknown
}

export function ErrorPage({ message }: ErrorPageProps) {
  const rem = useRem()

  let index = 0

  useEffect(() => {
    playSound(sounds.alert_bad)
  }, [])

  return (
    <Layer>
      <Frame
        key="background"
        backgroundColor={palette.eerie}
        size={new UDim2(1, 0, 1, 0)}
      >
        <uilistlayout
          key="layout"
          FillDirection="Vertical"
          VerticalAlignment="Center"
          HorizontalAlignment="Center"
          SortOrder="LayoutOrder"
        />

        <Text
          key="icon"
          text="🤖⁉️"
          textSize={rem(5)}
          size={new UDim2(0, rem(5), 0, rem(5))}
          layoutOrder={index++}
        />

        <Text
          key="title"
          font={fonts.inter.bold}
          text="System malfunction"
          textColor={palette.text}
          textSize={rem(3)}
          textAutoResize="XY"
          layoutOrder={index++}
        />

        <Group
          key={`spacer-${index}`}
          size={new UDim2(0, 0, 0, rem(2))}
          layoutOrder={index++}
        />

        <Text
          key="subtitle"
          font={fonts.inter.regular}
          text="Something went wrong, and we were unable to recover."
          textColor={palette.text}
          textSize={rem(1.5)}
          textAutoResize="XY"
          layoutOrder={index++}
        />

        <Group
          key={`spacer-${index}`}
          size={new UDim2(0, 0, 0, rem(0.5))}
          layoutOrder={index++}
        />

        <Text
          key="callout"
          font={fonts.inter.regular}
          text="Please send this error to the developers, and try reconnecting:"
          textColor={palette.text}
          textSize={rem(1.5)}
          textAutoResize="XY"
          layoutOrder={index++}
        />

        <Group
          key={`spacer-${index}`}
          size={new UDim2(0, 0, 0, rem(2))}
          layoutOrder={index++}
        />

        <TextField
          key="message"
          clearTextOnFocus={false}
          textEditable={false}
          font={fonts.robotoMono.regular}
          text={`${message}`}
          textColor={palette.red}
          textSize={rem(1.5)}
          textAutoResize="XY"
          textXAlignment="Left"
          maxVisibleGraphemes={512}
          backgroundColor={palette.base}
          backgroundTransparency={0}
          cornerRadius={new UDim(0, rem(1.5))}
          layoutOrder={index++}
        >
          <uipadding
            key="padding"
            PaddingLeft={new UDim(0, rem(2))}
            PaddingRight={new UDim(0, rem(2))}
            PaddingTop={new UDim(0, rem(2))}
            PaddingBottom={new UDim(0, rem(2))}
          />

          <uistroke
            key="border"
            Color={palette.red}
            Transparency={0.3}
            Thickness={1}
            ApplyStrokeMode="Border"
          />
        </TextField>

        <Group
          key={`spacer-${index}`}
          size={new UDim2(0, 0, 0, rem(2))}
          layoutOrder={index++}
        />

        <PrimaryButton
          key="reconnect"
          onClick={async () =>
            TeleportService.TeleportToPlaceInstance(game.PlaceId, game.JobId)
          }
          overlayGradient={new ColorSequence(palette.blue, palette.pink)}
          size={new UDim2(0, rem(12), 0, rem(5))}
          layoutOrder={index++}
        >
          <Text
            key="text"
            font={fonts.inter.medium}
            text="Reconnect →"
            textColor={palette.base}
            textSize={rem(1.5)}
            size={new UDim2(1, 0, 1, 0)}
          />
        </PrimaryButton>
      </Frame>
    </Layer>
  )
}
