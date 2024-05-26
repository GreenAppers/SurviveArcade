import { CommandDefinition } from '@rbxts/cmdr'

export = identity<CommandDefinition>({
  Name: 'give',
  Description: 'Give player item',
  Group: 'Admin',
  Args: [
    {
      Type: 'player',
      Name: 'player',
      Description: 'Player',
    },
    {
      Type: 'item',
      Name: 'Item',
      Description: 'Item',
    },
    {
      Type: 'number',
      Name: 'Amount',
      Description: 'Amount',
      Default: 1,
    },
  ],
})
