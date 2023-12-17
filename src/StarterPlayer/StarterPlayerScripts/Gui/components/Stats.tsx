import { useSelector } from '@rbxts/react-reflex'
import Roact from '@rbxts/roact'
import { selectLocalPlayerScore } from 'ReplicatedStorage/shared/state'
import { formatInteger } from 'StarterPlayer/StarterPlayerScripts/utils'

import { useDefined, useRem } from '../hooks'
import { Group } from './Group'
import { StatsCard } from './StatsCard'

export function Stats() {
  const rem = useRem()
  const currentScore = useSelector(selectLocalPlayerScore())
  const score = useDefined<string | number>(currentScore, 'N/A')

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
        key="score"
        emoji="💯"
        label="Score"
        value={`${formatInteger(score)}`}
        primary={Color3.fromRGB(181, 64, 64)}
        secondary={Color3.fromRGB(150, 59, 84)}
        enabled={currentScore !== undefined}
        order={1}
      />
    </Group>
  )
}
