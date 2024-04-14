import { CommandDefinition } from '@rbxts/cmdr'

export = identity<CommandDefinition>({
  Name: 'claim',
  Description: 'Claim Player tycoon',
  Group: 'Admin',
  Args: [
    {
      Type: 'player',
      Name: 'player',
      Description: 'Player',
    },
    {
      Type: 'tycoon',
      Name: 'Tycoon',
      Description: 'Tycoon',
    },
  ],
})
