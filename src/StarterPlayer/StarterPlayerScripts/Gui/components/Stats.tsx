import { useSelector } from '@rbxts/react-reflex'
import Roact from '@rbxts/roact'
import { palette } from 'ReplicatedStorage/shared/constants/palette'
import { selectLocalPlayerScoreState } from 'ReplicatedStorage/shared/state'
import { formatInteger } from 'StarterPlayer/StarterPlayerScripts/utils'

import { useDefined, useRem } from '../hooks'
import { Group } from './Group'
import { StatsCard } from './StatsCard'

export function Stats() {
  const rem = useRem()
  const currentScore = useSelector(selectLocalPlayerScoreState())
  const score = useDefined<string | number>(currentScore?.score, 'N/A')
  const highScore = useDefined<string | number>(currentScore?.highScore, 'N/A')

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
        order={0}
      />

      <StatsCard
        key="score"
        emoji="💯"
        label="Score"
        value={`${formatInteger(score)}`}
        primary={palette.pink}
        secondary={palette.red}
        enabled={currentScore !== undefined}
        order={1}
      />
    </Group>
  )
}
