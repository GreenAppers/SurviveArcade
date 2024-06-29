import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { CollectionService, Workspace } from '@rbxts/services'
import { DIFFICULTY_TYPES } from 'ReplicatedStorage/shared/constants/core'
import { BallTag, DrainTag } from 'ReplicatedStorage/shared/constants/tags'
import { selectArcadeTableState } from 'ReplicatedStorage/shared/state'
import {
  ArcadeTableState,
  ArcadeTableStatus,
} from 'ReplicatedStorage/shared/state/ArcadeTablesState'
import { getArcadeTableFromDescendent } from 'ReplicatedStorage/shared/utils/arcade'
import {
  getCharacterFromUserId,
  getCharacterHumanoid,
} from 'ReplicatedStorage/shared/utils/player'
import { MapService } from 'ServerScriptService/services/MapService'
import { store } from 'ServerScriptService/store'
import { takeDamage } from 'ServerScriptService/utils/player'

@Component({ tag: DrainTag })
export class DrainComponent
  extends BaseComponent<{}, BasePart>
  implements OnStart
{
  constructor(private mapService: MapService) {
    super()
  }

  onStart() {
    const arcadeTable = getArcadeTableFromDescendent(this.instance)
    if (!arcadeTable) throw error('Drain has no ancestor ArcadeTable')

    this.instance.Touched?.Connect((hit) => {
      if (CollectionService.HasTag(hit, BallTag)) {
        const state = store.getState()
        const arcadeTableSelector = selectArcadeTableState(arcadeTable.Name)
        const arcadeTableState = arcadeTableSelector(state)

        this.handleBallTouched(arcadeTable, arcadeTableState, hit)
        return
      }
    })
  }

  handleBallTouched(
    arcadeTable: ArcadeTable,
    arcadeTableState: ArcadeTableState | undefined,
    part: BasePart,
  ) {
    const userId = arcadeTableState?.owner
    if (userId) {
      const character = getCharacterFromUserId(userId, Workspace)
      const humanoid = getCharacterHumanoid(character)
      const state = store.getState()
      const tableState = state.arcadeTables[arcadeTable.Name]
      if (
        humanoid &&
        tableState?.status === ArcadeTableStatus.Active &&
        state.game.difficulty !== DIFFICULTY_TYPES.peaceful
      ) {
        takeDamage(humanoid, math.huge, undefined, 'drain')
      }
    }
    task.wait(0.5)
    part.Destroy()
  }
}
