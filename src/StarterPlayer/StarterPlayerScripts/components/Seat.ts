import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { playSoundId } from 'ReplicatedStorage/shared/assets/sounds'
import { SeatTag } from 'ReplicatedStorage/shared/constants/tags'
import { selectArcadeTableType } from 'ReplicatedStorage/shared/state'
import { getArcadeTableFromDescendent } from 'ReplicatedStorage/shared/utils/arcade'
import { store } from 'StarterPlayer/StarterPlayerScripts/store'
import {
  EXCHANGE,
  testExchange,
} from 'StarterPlayer/StarterPlayerScripts/utils/exchange'

@Component({ tag: SeatTag })
export class SeatComponent extends BaseComponent<{}, Seat> implements OnStart {
  onStart() {
    const seat = this.instance
    const arcadeTable = getArcadeTableFromDescendent(this.instance)
    if (!arcadeTable) throw error('Seat has no ancestor ArcadeTable')

    seat.GetPropertyChangedSignal('Occupant').Connect(() => {
      if (!seat.Occupant) return
      const character = seat.Occupant.Parent as PlayerCharacter
      const player = game
        .GetService('Players')
        .GetPlayerFromCharacter(character)
      if (!player) return

      const tableType = store.getState(selectArcadeTableType(arcadeTable.Name))
      if (!testExchange(player.UserId, EXCHANGE[tableType])) return

      const audio = arcadeTable.FindFirstChild<{ SeatSound?: Sound }>('Audio')
      if (audio?.SeatSound) playSoundId(seat, audio.SeatSound.SoundId)
    })
  }
}
