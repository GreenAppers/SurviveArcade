import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { OwnerDoorTag } from 'ReplicatedStorage/shared/constants/tags'
import { selectTycoonState } from 'ReplicatedStorage/shared/state'
import {
  getCharacterHumanoid,
  getUserIdFromCharacter,
} from 'ReplicatedStorage/shared/utils/player'
import { getTycoonFromDescendent } from 'ReplicatedStorage/shared/utils/tycoon'
import { store } from 'ServerScriptService/store'
import { takeDamage } from 'ServerScriptService/utils/player'

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
      const humanoid = getCharacterHumanoid(hit.Parent)
      if (!humanoid) return
      const touchedPlayerUserId = getUserIdFromCharacter(hit.Parent)
      const tycoonState = tycoonSelector(store.getState())
      if (tycoonState.owner === touchedPlayerUserId) return
      takeDamage(humanoid, math.huge, tycoonState.owner, 'ownerDoor')
    })
  }
}
