import { useSelector } from '@rbxts/react-reflex'
import Roact from '@rbxts/roact'
import { selectGameState } from 'ReplicatedStorage/shared/state'
import { formatDuration } from 'StarterPlayer/StarterPlayerScripts/utils'

import { useRem } from '../hooks'
import { Group } from './Group'
import { StatsCard } from './StatsCard'

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
        primary={Color3.fromRGB(181, 64, 64)}
        secondary={Color3.fromRGB(150, 59, 84)}
        enabled={gameState.roundRemaining !== undefined}
        order={1}
      />
    </Group>
  )
}
