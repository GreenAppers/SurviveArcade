import { CommandDefinition } from '@rbxts/cmdr'

export = identity<CommandDefinition>({
  Name: 'op',
  Description: 'Extends operator permissions to Player',
  Group: 'Admin',
  Args: [
    {
      Type: 'player',
      Name: 'player',
      Description: 'Player',
    },
  ],
})
