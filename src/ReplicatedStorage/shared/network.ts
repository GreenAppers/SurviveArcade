import { Networking } from '@flamework/networking'
import { BroadcastAction } from '@rbxts/reflex'

interface ServerEvents {
  flipperFlip: (tableName: string, flipper: string) => void
  start: () => void
}

interface ServerFunctions {}

interface ClientEvents {
  alert: (
    message: string,
    emoji: string,
    color: Color3,
    colorSecondary: Color3,
    duration: number,
  ) => void
  arcadeTableMaterialize: (arcadeTableName: ArcadeTableName) => void
  dispatch: (actions: Array<BroadcastAction>) => void
  playerBounce: (position: Vector3) => void
  start: () => void
}

interface ClientFunctions {}

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>()

export const GlobalFunctions = Networking.createFunction<
  ServerFunctions,
  ClientFunctions
>()
