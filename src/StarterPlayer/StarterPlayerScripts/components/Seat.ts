import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { playSoundId } from 'ReplicatedStorage/shared/assets/sounds'
import { SeatTag } from 'ReplicatedStorage/shared/constants/tags'
import {
  selectPlayerState,
  selectTycoonsState,
} from 'ReplicatedStorage/shared/state'
import { findTycoonNameOwnedBy } from 'ReplicatedStorage/shared/state/TycoonState'
import { getArcadeTableFromDescendent } from 'ReplicatedStorage/shared/utils/arcade'
import { formatMessage, MESSAGE } from 'ReplicatedStorage/shared/utils/messages'
import { sendAlert } from 'StarterPlayer/StarterPlayerScripts/alerts'
import { store } from 'StarterPlayer/StarterPlayerScripts/store'

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

      const state = store.getState()
      if (!findTycoonNameOwnedBy(selectTycoonsState()(state), player.UserId)) {
        sendAlert({
          emoji: '🏗️',
          message: formatMessage(MESSAGE.TycoonNeeded),
        })
        return
      }

      if ((selectPlayerState(player.UserId)(state)?.dollars ?? 0) < 1) {
        sendAlert({
          emoji: '💰',
          message: formatMessage(MESSAGE.DollarsNeeded),
        })
        return
      }

      const audio = arcadeTable.FindFirstChild('Audio') as
        | { SeatSound?: Sound }
        | undefined
      if (audio?.SeatSound) playSoundId(seat, audio.SeatSound.SoundId)
    })
  }
}
