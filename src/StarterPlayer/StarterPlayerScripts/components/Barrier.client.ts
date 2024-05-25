import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { Players } from '@rbxts/services'
import { BarrierTag } from 'ReplicatedStorage/shared/constants/tags'
import { selectArcadeTableState } from 'ReplicatedStorage/shared/state'
import { getArcadeTableFromDescendent } from 'ReplicatedStorage/shared/utils/arcade'
import { sendAlert } from 'StarterPlayer/StarterPlayerScripts/alerts'
import { store } from 'StarterPlayer/StarterPlayerScripts/store'

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
      const humanoid = hit.Parent?.FindFirstChild<Humanoid>('Humanoid')
      if (!humanoid) return
      const touchedPlayer = Players.GetPlayerFromCharacter(hit.Parent)
      if (touchedPlayer?.UserId === Players.LocalPlayer.UserId) {
        this.debounce = true

        const state = store.getState()
        const arcadeTableSelector = selectArcadeTableState(arcadeTable.Name)
        const tableState = arcadeTableSelector(state)
        sendAlert({
          emoji: '🚧',
          message: `Score ${tableState?.scoreToWin} to defeat the barrier.`,
        })
        task.wait(5)
        this.debounce = false
      }
    })
  }
}
