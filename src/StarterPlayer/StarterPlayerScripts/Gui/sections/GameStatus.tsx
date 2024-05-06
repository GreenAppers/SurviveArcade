import React from '@rbxts/react'
import { useSelector } from '@rbxts/react-reflex'
import { palette } from 'ReplicatedStorage/shared/constants/palette'
import { selectGameState } from 'ReplicatedStorage/shared/state'
import { CardItem } from 'StarterPlayer/StarterPlayerScripts/Gui/components/CardItem'
import { Group } from 'StarterPlayer/StarterPlayerScripts/Gui/components/Group'
import { useRem } from 'StarterPlayer/StarterPlayerScripts/Gui/hooks'
import { formatDuration } from 'StarterPlayer/StarterPlayerScripts/utils/format'

export function GameStatus() {
  const rem = useRem()
  const gameState = useSelector(selectGameState())

  return (
    <Group
      size={new UDim2(1, 0, 0, rem(5))}
      position={new UDim2(0, 0, 0, rem(0))}
    >
      <uilistlayout
        SortOrder="LayoutOrder"
        FillDirection="Horizontal"
        VerticalAlignment="Center"
        HorizontalAlignment="Center"
        Padding={new UDim(0, rem(1))}
      />
      {gameState.roundActive && (
        <CardItem
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
