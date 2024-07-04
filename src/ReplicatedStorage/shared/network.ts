import { Networking } from '@flamework/networking'
import {
  ClientHandler,
  ServerHandler,
} from '@flamework/networking/out/events/types'
import { BroadcastAction } from '@rbxts/reflex'

interface ServerEvents {
  arcadeTableEvent: (
    tableName: string,
    partPath: string[],
    soundName?: string,
  ) => void
  start: () => void
}

interface ServerFunctions {}

interface ClientEvents {
  arcadeTableMaterialize: (arcadeTableName: ArcadeTableName) => void
  dispatch: (actions: Array<BroadcastAction>) => void
  message: (
    messageType: string,
    message: string,
    emoji?: string,
    color?: Color3,
    colorSecondary?: Color3,
    duration?: number,
  ) => void
  playerBounce: (position: Vector3) => void
  start: () => void
}

interface ClientFunctions {}

export type ClientNetwork = ClientHandler<ServerEvents, ClientEvents>

export type ServerNetwork = ServerHandler<ServerEvents, ClientEvents>

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>()

export const GlobalFunctions = Networking.createFunction<
  ServerFunctions,
  ClientFunctions
>()
