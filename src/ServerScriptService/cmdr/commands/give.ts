import { CommandDefinition } from '@rbxts/cmdr'

export = identity<CommandDefinition>({
  Name: 'give',
  Description: 'Give Player currency',
  Group: 'Admin',
  Args: [
    {
      Type: 'player',
      Name: 'player',
      Description: 'Player',
    },
    {
      Type: 'currency',
      Name: 'Currency',
      Description: 'Currency',
    },
    {
      Type: 'number',
      Name: 'Amount',
      Description: 'Amount',
    },
  ],
})