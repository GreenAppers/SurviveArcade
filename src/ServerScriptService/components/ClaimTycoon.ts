import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { ClaimTycoonTag } from 'ReplicatedStorage/shared/constants/tags'
import { selectTycoonState } from 'ReplicatedStorage/shared/state'
import { getUserIdFromCharacter } from 'ReplicatedStorage/shared/utils/player'
import { getTycoonPlotFromDescendent } from 'ReplicatedStorage/shared/utils/tycoon'
import { store } from 'ServerScriptService/store'

@Component({ tag: ClaimTycoonTag })
export class ClaimTycoonComponent
  extends BaseComponent<{}, BasePart>
  implements OnStart
{
  onStart() {
    this.instance.Touched?.Connect((hit) => {
      const humanoid = hit.Parent?.FindFirstChild<Humanoid>('Humanoid')
      if (!humanoid) return
      const touchedUserId = getUserIdFromCharacter(hit.Parent)
      if (!touchedUserId) return
      const tycoonPlot = getTycoonPlotFromDescendent(this.instance)
      if (!tycoonPlot) return
      const state = store.getState()
      const newState = store.claimTycoon(tycoonPlot.Name, touchedUserId)
      const tycoonSelector = selectTycoonState(tycoonPlot.Name)
      if (tycoonSelector(state) === tycoonSelector(newState)) return
      tycoonPlot.FindFirstChild('ClaimTycoon')?.Destroy()
    })
  }
}
