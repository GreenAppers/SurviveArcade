import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { SeatTag } from 'ReplicatedStorage/shared/constants/tags'
import { getArcadeTableFromDescendent } from 'ReplicatedStorage/shared/utils/arcade'
import { getUserIdFromCharacter } from 'ReplicatedStorage/shared/utils/player'
import { ArcadeTableService } from 'ServerScriptService/services/ArcadeTableService'
import { MapService } from 'ServerScriptService/services/MapService'

@Component({ tag: SeatTag })
export class SeatComponent extends BaseComponent<{}, Seat> implements OnStart {
  constructor(
    private arcadeTableService: ArcadeTableService,
    private mapService: MapService,
  ) {
    super()
  }

  onStart() {
    const seat = this.instance
    const arcadeTable = getArcadeTableFromDescendent(this.instance)
    if (!arcadeTable) throw error('Seat has no ancestor ArcadeTable')

    seat.GetPropertyChangedSignal('Occupant').Connect(() => {
      if (!seat.Occupant) {
        this.arcadeTableService.claimArcadeTable(arcadeTable.Name, undefined)
        return
      }
      const character = seat.Occupant.Parent as PlayerCharacter
      const userId = getUserIdFromCharacter(character)
      if (!userId) return
      if (!this.arcadeTableService.claimArcadeTable(arcadeTable.Name, userId)) {
        character.Humanoid.Sit = false
        return
      }
      this.mapService.activateNextTable(arcadeTable.Name, userId)
    })
  }
}
