import { Dependency } from '@flamework/core'
import { CommandContext } from '@rbxts/cmdr'
import { Logger } from '@rbxts/log'
import { logAndBroadcast } from 'ServerScriptService/utils/server'

export = function (context: CommandContext, message: string) {
  logAndBroadcast(Dependency<Logger>(), `[${context.Executor.Name}] ${message}`)
}
