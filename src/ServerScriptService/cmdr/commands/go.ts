import { CommandDefinition } from '@rbxts/cmdr'

export = identity<CommandDefinition>({
  Name: 'go',
  Description: 'Teleport Player',
  Group: 'Admin',
  Args: [
    {
      Type: 'player',
      Name: 'player',
      Description: 'Player',
    },
    {
      Type: 'string',
      Name: 'target',
      Description: 'Target',
    },
  ],
})
