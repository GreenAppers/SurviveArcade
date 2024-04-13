import { useSelector } from '@rbxts/react-reflex'
import Roact from '@rbxts/roact'
import { USER_ID } from 'ReplicatedStorage/shared/constants/core'
import { palette } from 'ReplicatedStorage/shared/constants/palette'
import { selectLocalPlayerState } from 'ReplicatedStorage/shared/state'
import { CardItem } from 'StarterPlayer/StarterPlayerScripts/Gui/components/CardItem'
import { Group } from 'StarterPlayer/StarterPlayerScripts/Gui/components/Group'
import { useRem } from 'StarterPlayer/StarterPlayerScripts/Gui/hooks'
import {
  selectGuideText,
  store,
} from 'StarterPlayer/StarterPlayerScripts/store'

export function Settings() {
  const rem = useRem()
  const playerState = useSelector(selectLocalPlayerState())
  const guideText = useSelector(selectGuideText)

  return (
    <Group>
      <uipadding
        key="margin"
        PaddingBottom={new UDim(0, rem(3))}
        PaddingLeft={new UDim(0, rem(3))}
      />

      <uilistlayout
        key="layout"
        FillDirection="Vertical"
        HorizontalAlignment="Left"
        VerticalAlignment="Bottom"
        Padding={new UDim(0, rem(1))}
        SortOrder="LayoutOrder"
      />

      <CardItem
        key="guide"
        emoji="➡️"
        label="Guide"
        value={
          playerState?.settings?.guide ? (guideText ? guideText : 'On') : 'Off'
        }
        primary={palette.blue}
        secondary={palette.sky}
        enabled={true}
        order={2}
        onClick={() => store.toggleGuide(USER_ID)}
      />
    </Group>
  )
}
