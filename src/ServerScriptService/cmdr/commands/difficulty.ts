import { CommandDefinition } from '@rbxts/cmdr'

export = identity<CommandDefinition>({
  Name: 'difficulty',
  Aliases: [],
  Description: 'Sets or queries the difficulty level (peaceful, normal, etc.).',
  Group: 'Admin',
  Args: [
    {
      Type: 'difficulty',
      Name: 'Difficulty',
      Description: 'Specifies the new difficulty level.',
    },
  ],
})
