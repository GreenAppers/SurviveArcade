import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { SeatTag } from 'ReplicatedStorage/shared/constants/tags'
import { store } from 'ServerScriptService/store'
import { getArcadeTableFromDescendent } from 'ServerScriptService/utils'

@Component({ tag: SeatTag })
export class SeatComponent extends BaseComponent<{}, Seat> implements OnStart {
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
      if (player) store.claimArcadeTable(arcadeTable.Name, player)
    })
  }
}
