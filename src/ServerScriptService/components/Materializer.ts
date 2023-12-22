import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { Players } from '@rbxts/services'
import { MaterializerTag } from 'ReplicatedStorage/shared/constants/tags'
import { MapService } from 'ServerScriptService/services/MapService'
import { getArcadeTableFromDescendent } from 'ServerScriptService/utils'

@Component({ tag: MaterializerTag })
export class MaterializerComponent
  extends BaseComponent<{}, BasePart>
  implements OnStart
{
  constructor(private mapService: MapService) {
    super()
  }

  onStart() {
    const arcadeTable = getArcadeTableFromDescendent(this.instance)
    if (!arcadeTable) throw error('Materializer has no ancestor ArcadeTable')

    this.instance.Touched?.Connect((hit) => {
      const humanoid = hit.Parent?.FindFirstChild('Humanoid') as
        | Humanoid
        | undefined
      if (humanoid) {
        const touchedPlayer = Players.GetPlayerFromCharacter(hit.Parent)
        if (touchedPlayer) this.handlePlayerTouched(arcadeTable, touchedPlayer)
      }
    })
  }

  handlePlayerTouched(arcadeTable: ArcadeTable, _player: Player) {
    this.mapService.materializeTable(arcadeTable.Name)
  }
}
