import { OnStart, Service } from '@flamework/core'
import { Logger } from '@rbxts/log'
import { Debris, ReplicatedStorage, Workspace } from '@rbxts/services'
import { findDescendentsWhichAre } from 'ReplicatedStorage/shared/utils/instance'
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
    let firstPart: BasePart | undefined
    const lootBox = ReplicatedStorage.Common.LootBox.Clone()
    findDescendentsWhichAre<BasePart>(lootBox, 'BasePart').forEach((part) => {
      if (!firstPart) {
        firstPart = part
      } else {
        const weld = new Instance('WeldConstraint')
        weld.Part0 = firstPart
        weld.Part1 = part
        weld.Parent = part
      }
    })
    lootBox.PivotTo(this.mapService.getRandomSpawnLocation(150))
    lootBox.Parent = Workspace
    Debris.AddItem(lootBox, 35)
  }
}
