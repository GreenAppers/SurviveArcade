import { OnStart, Service } from '@flamework/core'
import { Logger } from '@rbxts/log'
import { Debris, ReplicatedStorage, Workspace } from '@rbxts/services'
import {
  findDescendentsWhichAre,
  weldParts,
} from 'ReplicatedStorage/shared/utils/instance'
import { MapService } from 'ServerScriptService/services/MapService'

@Service()
export class LootService implements OnStart {
  constructor(
    protected readonly logger: Logger,
    protected readonly mapService: MapService,
  ) {}

  onStart() {
    while (wait(math.random(10, 60))[0]) this.dropLootBox()
  }

  dropLootBox() {
    const lootBox = ReplicatedStorage.Common.LootBox.Clone()
    weldParts(findDescendentsWhichAre<BasePart>(lootBox, 'BasePart'))
    lootBox.PivotTo(this.mapService.getRandomSpawnLocation(150))
    lootBox.Parent = Workspace
    Debris.AddItem(lootBox, 35)
  }
}
