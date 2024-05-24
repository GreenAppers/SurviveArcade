import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { Players, Teams } from '@rbxts/services'
import { TEAM_NAMES } from 'ReplicatedStorage/shared/constants/core'
import { JoinTeamTag } from 'ReplicatedStorage/shared/constants/tags'
import {
  selectArcadeTableState,
  selectGameState,
} from 'ReplicatedStorage/shared/state'
import { getArcadeTableFromDescendent } from 'ReplicatedStorage/shared/utils/arcade'
import { getCharacterHumanoid } from 'ReplicatedStorage/shared/utils/player'
import { store } from 'ServerScriptService/store'

@Component({ tag: JoinTeamTag })
export class JoinTeamComponent
  extends BaseComponent<{}, BasePart>
  implements OnStart
{
  onStart() {
    const arcadeTable = getArcadeTableFromDescendent(this.instance)
    if (!arcadeTable) throw error('No ancestor ArcadeTable')
    this.instance.Touched?.Connect((hit) => {
      const humanoid = getCharacterHumanoid(hit.Parent)
      if (humanoid) {
        const touchedPlayer = Players.GetPlayerFromCharacter(hit.Parent)
        if (touchedPlayer) {
          const state = store.getState()
          const arcadeTableSelector = selectArcadeTableState(arcadeTable.Name)
          const tableState = arcadeTableSelector(state)
          const gameState = selectGameState()(state)
          if (gameState.teamsActive) {
            touchedPlayer.Team =
              Teams[tableState?.teamName || TEAM_NAMES.UnclaimedTeam]
          }
        }
      }
    })
  }
}
