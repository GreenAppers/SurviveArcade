import { useSelector } from '@rbxts/react-reflex'
import Roact from '@rbxts/roact'
import { USER_ID } from 'ReplicatedStorage/shared/constants/core'
import { palette } from 'ReplicatedStorage/shared/constants/palette'
import { selectLocalPlayerState } from 'ReplicatedStorage/shared/state'
import { Group } from 'StarterPlayer/StarterPlayerScripts/Gui/components/Group'
import { StatsCard } from 'StarterPlayer/StarterPlayerScripts/Gui/components/StatsCard'
import {
  useDefined,
  useRem,
} from 'StarterPlayer/StarterPlayerScripts/Gui/hooks'
import { store } from 'StarterPlayer/StarterPlayerScripts/store'
import { formatInteger } from 'StarterPlayer/StarterPlayerScripts/utils'

export function Stats() {
  const rem = useRem()
  const playerState = useSelector(selectLocalPlayerState())
  const score = useDefined<string | number>(playerState?.score, 'N/A')
  const currentTable = playerState?.arcade?.[playerState?.tableType]
  const highScore = useDefined<string | number>(currentTable?.highScore, 'N/A')

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

      <StatsCard
        key="highScore"
        emoji="🏆"
        label="High Score"
        value={`${formatInteger(highScore)}`}
        primary={palette.yellow}
        secondary={palette.orange}
        enabled={highScore !== undefined}
        order={1}
      />

      <StatsCard
        key="score"
        emoji="💯"
        label="Score"
        value={`${formatInteger(score)}`}
        primary={palette.pink}
        secondary={palette.red}
        enabled={currentTable !== undefined}
        order={2}
      />

      <StatsCard
        key="guide"
        emoji="➡️"
        label="Guide"
        value={playerState?.settings?.guide ? 'On' : 'Off'}
        primary={palette.green}
        secondary={palette.brown}
        enabled={true}
        order={0}
        onClick={() => store.toggleGuide(USER_ID)}
      />
    </Group>
  )
}
