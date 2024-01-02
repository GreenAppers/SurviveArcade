import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { Players, Teams } from '@rbxts/services'
import { JoinTeamTag } from 'ReplicatedStorage/shared/constants/tags'
import { selectArcadeTableState } from 'ReplicatedStorage/shared/state'
import { getArcadeTableFromDescendent } from 'ReplicatedStorage/shared/utils/arcade'
import { store } from 'ServerScriptService/store'

@Component({ tag: JoinTeamTag })
export class JoinTeamComponent
  extends BaseComponent<{}, BasePart>
  implements OnStart
{
  onStart() {
    const arcadeTable = getArcadeTableFromDescendent(this.instance)
    if (!arcadeTable) throw error('No ancestor ArcadeTable')
    const arcadeTableSelector = selectArcadeTableState(arcadeTable.Name)

    this.instance.Touched?.Connect((hit) => {
      const humanoid = hit.Parent?.FindFirstChild('Humanoid') as
        | Humanoid
        | undefined
      if (humanoid) {
        const touchedPlayer = Players.GetPlayerFromCharacter(hit.Parent)
        if (touchedPlayer) {
          const tableState = arcadeTableSelector(store.getState())
          touchedPlayer.Team = Teams[tableState?.teamName || 'Unclaimed Team']
        }
      }
    })
  }
}
