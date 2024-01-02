import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { CollectionService } from '@rbxts/services'
import { BallTag, DrainTag } from 'ReplicatedStorage/shared/constants/tags'
import { ArcadeTableStatus } from 'ReplicatedStorage/shared/state/ArcadeTablesState'
import { getArcadeTableFromDescendent } from 'ReplicatedStorage/shared/utils/arcade'
import { MapService } from 'ServerScriptService/services/MapService'
import { store } from 'ServerScriptService/store'
import { getArcadeTableOwner } from 'ServerScriptService/utils'

@Component({ tag: DrainTag })
export class DrainComponent
  extends BaseComponent<{}, BasePart>
  implements OnStart
{
  constructor(private mapService: MapService) {
    super()
  }

  onStart() {
    const arcadeTable = getArcadeTableFromDescendent(this.instance)
    if (!arcadeTable) throw error('Drain has no ancestor ArcadeTable')

    this.instance.Touched?.Connect((hit) => {
      if (CollectionService.HasTag(hit, BallTag)) {
        this.handleBallTouched(arcadeTable, hit)
        return
      }
    })
  }

  handleBallTouched(arcadeTable: ArcadeTable, part: BasePart) {
    const player = getArcadeTableOwner(arcadeTable)
    if (player) {
      const character: (Model & { Humanoid?: Humanoid }) | undefined =
        player.Character
      const state = store.getState().arcadeTables[arcadeTable.Name]
      if (state?.status === ArcadeTableStatus.Active && character?.Humanoid) {
        character.Humanoid.Health = 0
      }
    }
    task.wait(0.5)
    part.Destroy()
  }
}
