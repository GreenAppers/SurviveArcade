import { useSelector } from '@rbxts/react-reflex'
import Roact from '@rbxts/roact'
import { selectGameState } from 'ReplicatedStorage/shared/state'
import { formatDuration } from 'StarterPlayer/StarterPlayerScripts/utils'

import { useRem } from '../hooks'
import { Group } from './Group'
import { StatsCard } from './StatsCard'
import { palette } from 'ReplicatedStorage/shared/constants/palette'

export function GameStatus() {
  const rem = useRem()
  const gameState = useSelector(selectGameState())

  return (
    <Group
      key="margin"
      size={new UDim2(1, 0, 0, rem(5))}
      position={new UDim2(0, 0, 0, rem(0))}
    >
      <uilistlayout
        key="layout"
        SortOrder="LayoutOrder"
        FillDirection="Horizontal"
        VerticalAlignment="Center"
        HorizontalAlignment="Center"
        Padding={new UDim(0, rem(1))}
      />

      <StatsCard
        key="remaining"
        emoji="⏰"
        label="Remaining"
        value={`${formatDuration(gameState.roundRemaining)}`}
        primary={palette.red}
        secondary={palette.orange}
        enabled={gameState.roundRemaining !== undefined}
        order={1}
      />
    </Group>
  )
}
