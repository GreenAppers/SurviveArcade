import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { Players, TeleportService } from '@rbxts/services'
import {
  HUMAN_PLACE_ID,
  START_PLACE_ID,
} from 'ReplicatedStorage/shared/constants/core'
import { TeleporterTag } from 'ReplicatedStorage/shared/constants/tags'

@Component({ tag: TeleporterTag })
export class TeleporterComponent
  extends BaseComponent<{ Destination?: string }, BasePart>
  implements OnStart
{
  debouncePlayer = new Map<number, boolean>()

  onStart() {
    this.instance.Touched?.Connect((hit) => {
      const humanoid = hit.Parent?.FindFirstChild('Humanoid') as
        | Humanoid
        | undefined
      if (humanoid) {
        const touchedPlayer = Players.GetPlayerFromCharacter(hit.Parent)
        if (touchedPlayer) {
          if (this.debouncePlayer.get(touchedPlayer.UserId)) return
          this.debouncePlayer.set(touchedPlayer.UserId, true)

          let placeId = 0
          switch (this.attributes.Destination) {
            case 'ElfMap':
              placeId = START_PLACE_ID
              break
            case 'HumanMap':
              placeId = HUMAN_PLACE_ID
              break
          }
          if (placeId) {
            TeleportService.TeleportAsync(placeId, [touchedPlayer])
          }

          wait(2)
          this.debouncePlayer.delete(touchedPlayer.UserId)
        }
      }
    })
  }
}
