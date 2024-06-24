import { CommandDefinition } from '@rbxts/cmdr'

export = identity<CommandDefinition>({
  Name: 'say',
  Description: 'Broadcasts message to all players on the server.',
  Group: 'Admin',
  Args: [
    {
      Type: 'string',
      Name: 'message',
      Description: 'Message',
    },
  ],
})
