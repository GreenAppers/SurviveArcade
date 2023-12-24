import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { Players } from '@rbxts/services'
import { BarrierTag } from 'ReplicatedStorage/shared/constants/tags'
import { sendAlert } from '../alerts'

@Component({ tag: BarrierTag })
export class BarrierComponent
  extends BaseComponent<{}, BasePart>
  implements OnStart
{
  debounce = false

  onStart() {
    this.instance.Touched?.Connect((hit) => {
      if (this.debounce) return
      const humanoid = hit.Parent?.FindFirstChild('Humanoid') as
        | Humanoid
        | undefined
      if (!humanoid) return
      const touchedPlayer = Players.GetPlayerFromCharacter(hit.Parent)
      if (touchedPlayer?.UserId === Players.LocalPlayer.UserId) {
        this.debounce = true
        sendAlert({ message: 'Complete the table first' })
        task.wait(5)
        this.debounce = false
      }
    })
  }
}
