import { Dependency } from '@flamework/core'
import { CommandContext } from '@rbxts/cmdr'
import { MapService } from 'ServerScriptService/services/MapService'

export = function (_context: CommandContext, mapName: string) {
  const mapService = Dependency<MapService>()
  mapService.loadMap(mapName)
}
