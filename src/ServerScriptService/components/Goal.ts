import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { CollectionService } from '@rbxts/services'
import {
  BallTag,
  GoalTag,
  PuckTag,
} from 'ReplicatedStorage/shared/constants/tags'
import { selectArcadeTableState } from 'ReplicatedStorage/shared/state'
import { mechanics } from 'ReplicatedStorage/shared/tables/mechanics'
import { getArcadeTableFromDescendent } from 'ReplicatedStorage/shared/utils/arcade'
import { store } from 'ServerScriptService/store'

@Component({ tag: GoalTag })
export class GoalComponent
  extends BaseComponent<{ Team?: string }, BasePart>
  implements OnStart
{
  debounce = false

  onStart() {
    const arcadeTable = getArcadeTableFromDescendent(this.instance)
    if (!arcadeTable) throw error('Goal has no ancestor ArcadeTable')
    this.instance.Touched?.Connect((hit) => {
      if (
        CollectionService.HasTag(hit, BallTag) ||
        CollectionService.HasTag(hit, PuckTag)
      ) {
        this.handleGoal(arcadeTable, hit, this.attributes.Team)
      }
    })
  }

  handleGoal(arcadeTable: ArcadeTable, part: BasePart, team?: string) {
    if (this.debounce) return
    this.debounce = true

    const material = this.instance.Material
    this.instance.Material = Enum.Material.Neon

    const arcadeTableSelector = selectArcadeTableState(arcadeTable.Name)
    const arcadeTableState = arcadeTableSelector(
      store.addArcadeTableGoals(arcadeTable.Name, 1, team),
    )

    /* mechanics[arcadeTableState.tableType].onNPCPlayingBehavior(
      arcadeTable.Name,
      sourceUserId,
      obj,
    )*/

    task.wait(0.5)

    part.Destroy()
    this.instance.Material = material
    this.debounce = false
  }
}
