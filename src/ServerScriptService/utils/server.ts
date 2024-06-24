import { Logger } from '@rbxts/log'
import { Events } from 'ServerScriptService/network'

export function logAndBroadcast(logger: Logger, message: string) {
  logger.Info(message)
  Events.message.broadcast('log', message)
}
