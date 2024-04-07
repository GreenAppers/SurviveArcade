import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { Players } from '@rbxts/services'
import { BarrierTag } from 'ReplicatedStorage/shared/constants/tags'
import { getArcadeTableFromDescendent } from 'ReplicatedStorage/shared/utils/arcade'
import { sendAlert } from 'StarterPlayer/StarterPlayerScripts/alerts'
import { getArcadeTableStateFromDescendent } from 'StarterPlayer/StarterPlayerScripts/utils'

@Component({ tag: BarrierTag })
export class BarrierComponent
  extends BaseComponent<{}, BasePart>
  implements OnStart
{
  debounce = false

  onStart() {
    const arcadeTable = getArcadeTableFromDescendent(this.instance)
    if (!arcadeTable) throw error('Barrier has no ancestor ArcadeTable')

    this.instance.Touched?.Connect((hit) => {
      if (this.debounce) return
      const humanoid = hit.Parent?.FindFirstChild('Humanoid') as
        | Humanoid
        | undefined
      if (!humanoid) return
      const touchedPlayer = Players.GetPlayerFromCharacter(hit.Parent)
      if (touchedPlayer?.UserId === Players.LocalPlayer.UserId) {
        this.debounce = true
        sendAlert({
          emoji: '🚧',
          message: `Score ${getArcadeTableStateFromDescendent(this.instance)
            ?.scoreToWin} to defeat the barrier.`,
        })
        task.wait(5)
        this.debounce = false
      }
    })
  }
}
