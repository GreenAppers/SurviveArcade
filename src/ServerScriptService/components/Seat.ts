import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { SeatTag } from 'ReplicatedStorage/shared/constants/tags'
import { getArcadeTableFromDescendent } from 'ReplicatedStorage/shared/utils/arcade'
import { MapService } from 'ServerScriptService/services/MapService'
import { store } from 'ServerScriptService/store'

@Component({ tag: SeatTag })
export class SeatComponent extends BaseComponent<{}, Seat> implements OnStart {
  constructor(private mapService: MapService) {
    super()
  }

  onStart() {
    const seat = this.instance
    const arcadeTable = getArcadeTableFromDescendent(this.instance)
    if (!arcadeTable) throw error('Seat has no ancestor ArcadeTable')

    seat.GetPropertyChangedSignal('Occupant').Connect(() => {
      if (!seat.Occupant) {
        store.claimArcadeTable(arcadeTable.Name, undefined)
        return
      }
      const character = seat.Occupant.Parent
      const player = game
        .GetService('Players')
        .GetPlayerFromCharacter(character)
      if (player) {
        store.claimArcadeTable(arcadeTable.Name, player)
        this.mapService.materializeTable(arcadeTable.Name)
      }
    })
  }
}
