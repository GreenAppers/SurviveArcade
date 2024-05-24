import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { MaterializeTag } from 'ReplicatedStorage/shared/constants/tags'
import { getArcadeTableFromDescendent } from 'ReplicatedStorage/shared/utils/arcade'
import {
  getCharacterHumanoid,
  getUserIdFromCharacter,
} from 'ReplicatedStorage/shared/utils/player'
import { MapService } from 'ServerScriptService/services/MapService'

@Component({ tag: MaterializeTag })
export class MaterializeComponent
  extends BaseComponent<{}, BasePart>
  implements OnStart
{
  constructor(private mapService: MapService) {
    super()
  }

  onStart() {
    const arcadeTable = getArcadeTableFromDescendent(this.instance)
    if (!arcadeTable) throw error('No ancestor ArcadeTable')

    this.instance.Touched?.Connect((hit) => {
      const humanoid = getCharacterHumanoid(hit.Parent)
      if (humanoid) {
        const userId = getUserIdFromCharacter(hit.Parent)
        if (userId) this.handlePlayerTouched(arcadeTable, userId)
      }
    })
  }

  handlePlayerTouched(arcadeTable: ArcadeTable, userId: number) {
    this.mapService.activateNextTable(arcadeTable.Name, userId)
  }
}
