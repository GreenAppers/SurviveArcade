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
  arcadeTableNewPiece: (
    arcadeTableName: ArcadeTableName,
    pieceType: string,
    pieceName: string,
  ) => void
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

export type ClientNetworkEvents = ClientHandler<ServerEvents, ClientEvents>

export type ServerNetworkEvents = ServerHandler<ClientEvents, ServerEvents>

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>()

export const GlobalFunctions = Networking.createFunction<
  ServerFunctions,
  ClientFunctions
>()
