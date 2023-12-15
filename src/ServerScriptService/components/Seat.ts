import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { store } from 'ServerScriptService/store'
import { getParentArcadeTable } from 'ServerScriptService/utils'

@Component({ tag: 'Seat' })
export class SeatComponent extends BaseComponent implements OnStart {
  onStart() {
    const seat = this.instance as Seat
    const arcadeTable = getParentArcadeTable(this.instance)

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
