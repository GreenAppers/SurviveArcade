import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { Players } from '@rbxts/services'
import { ClaimTycoonTag } from 'ReplicatedStorage/shared/constants/tags'
import { getTycoonPlotNameFromDescendent } from 'ReplicatedStorage/shared/utils/tycoon'
import { store } from 'ServerScriptService/store'

@Component({ tag: ClaimTycoonTag })
export class ClaimTycoonComponent
  extends BaseComponent<{}, BasePart>
  implements OnStart
{
  onStart() {
    this.instance.Touched?.Connect((hit) => {
      const humanoid = hit.Parent?.FindFirstChild('Humanoid') as
        | Humanoid
        | undefined
      if (!humanoid) return
      const touchedPlayer = Players.GetPlayerFromCharacter(hit.Parent)
      if (!touchedPlayer) return
      const tycoonName = getTycoonPlotNameFromDescendent(this.instance)
      if (!tycoonName) return
      store.claimTycoon(tycoonName, touchedPlayer)
    })
  }
}
