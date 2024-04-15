import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { Players } from '@rbxts/services'
import { OwnerDoorTag } from 'ReplicatedStorage/shared/constants/tags'
import { selectTycoonState } from 'ReplicatedStorage/shared/state'
import { getTycoonFromDescendent } from 'ReplicatedStorage/shared/utils/tycoon'
import { store } from 'ServerScriptService/store'

@Component({ tag: OwnerDoorTag })
export class OwnerDoorComponent
  extends BaseComponent<{}, BasePart>
  implements OnStart
{
  onStart() {
    const tycoon = getTycoonFromDescendent(this.instance)
    if (!tycoon) return
    const tycoonSelector = selectTycoonState(tycoon.Name)
    this.instance.Touched?.Connect((hit) => {
      const humanoid = hit.Parent?.FindFirstChild('Humanoid') as
        | Humanoid
        | undefined
      if (!humanoid) return
      const touchedPlayer = Players.GetPlayerFromCharacter(hit.Parent)
      const tycoonState = tycoonSelector(store.getState())
      if (tycoonState.owner === touchedPlayer?.UserId) return
      humanoid.Health = 0
    })
  }
}
