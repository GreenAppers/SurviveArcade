import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { playSoundId } from 'ReplicatedStorage/shared/assets/sounds/play-sound'
import { ScorerTag } from 'ReplicatedStorage/shared/constants/tags'
import { selectArcadeTableState } from 'ReplicatedStorage/shared/state'
import { getArcadeTableFromDescendent } from 'ReplicatedStorage/shared/utils/arcade'
import { ArcadeTableService } from 'ServerScriptService/services/ArcadeTableService'
import { store } from 'ServerScriptService/store'

@Component({ tag: ScorerTag })
export class ScorerComponent
  extends BaseComponent<{}, BasePart>
  implements OnStart
{
  constructor(private arcadeTableService: ArcadeTableService) {
    super()
  }

  onStart() {
    const part = this.instance
    const arcadeTable = getArcadeTableFromDescendent(this.instance)
    if (!arcadeTable) throw error('Scorer has no ancestor ArcadeTable')

    part.Touched?.Connect((_hit) => {
      part.Material = Enum.Material.Neon

      const state = store.getState()
      const arcadeTableSelector = selectArcadeTableState(arcadeTable.Name)
      const arcadeTableState = arcadeTableSelector(state)

      const userId = arcadeTableState?.owner
      if (userId)
        this.arcadeTableService.addScore(
          userId,
          arcadeTableState.tableName,
          arcadeTableState.tableType,
          1000,
        )

      const audio = arcadeTable.FindFirstChild<{ ScorerSound?: Sound }>('Audio')
      if (audio?.ScorerSound) playSoundId(part, audio.ScorerSound.SoundId)

      task.wait(0.5)
      part.Material = Enum.Material.Plastic
    })
  }
}
