import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { Players } from '@rbxts/services'
import { MaterializeTag } from 'ReplicatedStorage/shared/constants/tags'
import { getArcadeTableFromDescendent } from 'ReplicatedStorage/shared/utils/arcade'
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
      const humanoid = hit.Parent?.FindFirstChild('Humanoid') as
        | Humanoid
        | undefined
      if (humanoid) {
        const touchedPlayer = Players.GetPlayerFromCharacter(hit.Parent)
        if (touchedPlayer) this.handlePlayerTouched(arcadeTable, touchedPlayer)
      }
    })
  }

  handlePlayerTouched(arcadeTable: ArcadeTable, player: Player) {
    this.mapService.activateNextTable(arcadeTable.Name, player)
  }
}
