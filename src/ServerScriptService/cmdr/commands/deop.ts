import { CommandDefinition } from '@rbxts/cmdr'

export = identity<CommandDefinition>({
  Name: 'deop',
  Description: 'Revokes operator permissions from Player',
  Group: 'Admin',
  Args: [
    {
      Type: 'player',
      Name: 'player',
      Description: 'Player',
    },
  ],
})
