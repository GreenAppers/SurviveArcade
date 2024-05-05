import React, { useMemo } from '@rbxts/react'
import { useSelector } from '@rbxts/react-reflex'
import {
  CURRENCY_EMOJIS,
  CURRENCY_TYPES,
} from 'ReplicatedStorage/shared/constants/core'
import { palette } from 'ReplicatedStorage/shared/constants/palette'
import { selectLocalPlayerState } from 'ReplicatedStorage/shared/state'
import { abbreviator } from 'ReplicatedStorage/shared/utils/currency'
import { CardItem } from 'StarterPlayer/StarterPlayerScripts/Gui/components/CardItem'
import { Group } from 'StarterPlayer/StarterPlayerScripts/Gui/components/Group'
import {
  useDefined,
  useRem,
} from 'StarterPlayer/StarterPlayerScripts/Gui/hooks'

export function Currency() {
  const rem = useRem()
  const playerState = useSelector(selectLocalPlayerState())
  const dollars = useDefined<string | number>(playerState?.dollars, 'N/A')
  const tickets = useDefined<string | number>(playerState?.tickets, 'N/A')
  const levity = useDefined<string | number>(playerState?.levity, 'N/A')
  const dollarsFormatted = useMemo(
    () =>
      typeIs(dollars, 'string') ? dollars : abbreviator.numberToString(dollars),
    [dollars],
  )
  const ticketsFormatted = useMemo(
    () =>
      typeIs(tickets, 'string') ? tickets : abbreviator.numberToString(tickets),
    [tickets],
  )
  const levityFormatted = useMemo(
    () =>
      typeIs(levity, 'string') ? levity : abbreviator.numberToString(levity),
    [levity],
  )

  return (
    <Group
      position={new UDim2(1, 0, 0.5, 0)}
      anchorPoint={new Vector2(1.0, 0.5)}
      automaticSize={Enum.AutomaticSize.X}
      size={new UDim2(0, 0, 0, 0)}
    >
      <uilistlayout
        FillDirection="Vertical"
        HorizontalAlignment="Left"
        VerticalAlignment="Center"
        Padding={new UDim(0, rem(1))}
        SortOrder="LayoutOrder"
      />

      <CardItem
        emoji={CURRENCY_EMOJIS.Tickets}
        label={CURRENCY_TYPES.Tickets}
        value={ticketsFormatted}
        primary={palette.pink}
        secondary={palette.red}
        enabled={tickets !== undefined}
        order={1}
      />

      <CardItem
        emoji={CURRENCY_EMOJIS.Dollars}
        label={CURRENCY_TYPES.Dollars}
        value={dollarsFormatted}
        primary={palette.green}
        secondary={palette.brown}
        enabled={dollars !== undefined}
        order={2}
      />

      <CardItem
        emoji={CURRENCY_EMOJIS.Levity}
        label={CURRENCY_TYPES.Levity}
        value={levityFormatted}
        primary={palette.yellow}
        secondary={palette.orange}
        enabled={true}
        order={3}
      />
    </Group>
  )
}
