import { CommandDefinition } from '@rbxts/cmdr'

export = identity<CommandDefinition>({
  Name: 'changemap',
  Aliases: [],
  Description: 'Sets or queries the current map.',
  Group: 'Admin',
  Args: [
    {
      Type: 'string',
      Name: 'Map',
      Description: 'Specifies the new map name.',
    },
  ],
})
