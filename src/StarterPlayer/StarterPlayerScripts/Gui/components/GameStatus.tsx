import { useSelector } from '@rbxts/react-reflex'
import Roact from '@rbxts/roact'
import { palette } from 'ReplicatedStorage/shared/constants/palette'
import { selectGameState } from 'ReplicatedStorage/shared/state'
import { Group } from 'StarterPlayer/StarterPlayerScripts/Gui/components/Group'
import { StatsCard } from 'StarterPlayer/StarterPlayerScripts/Gui/components/StatsCard'
import { useRem } from 'StarterPlayer/StarterPlayerScripts/Gui/hooks'
import { formatDuration } from 'StarterPlayer/StarterPlayerScripts/utils'

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
      {gameState.roundActive && (
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
      )}
    </Group>
  )
}
