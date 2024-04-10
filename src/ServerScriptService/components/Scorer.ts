import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { playSoundId } from 'ReplicatedStorage/shared/assets/sounds/play-sound'
import { ScorerTag } from 'ReplicatedStorage/shared/constants/tags'
import { GameService } from 'ServerScriptService/services/GameService'
import {
  getArcadeTableAndStateFromDescendent,
  getArcadeTableOwner,
} from 'ServerScriptService/utils'

@Component({ tag: ScorerTag })
export class ScorerComponent
  extends BaseComponent<{}, BasePart>
  implements OnStart
{
  constructor(private gameService: GameService) {
    super()
  }

  onStart() {
    const part = this.instance
    const [arcadeTable, arcadeTableState] =
      getArcadeTableAndStateFromDescendent(this.instance)
    if (!arcadeTable || !arcadeTableState)
      throw error('Scorer has no ancestor ArcadeTable')

    part.Touched?.Connect((_hit) => {
      part.Material = Enum.Material.Neon

      const player = getArcadeTableOwner(arcadeTable)
      if (player)
        this.gameService.addScore(
          player.UserId,
          arcadeTableState.tableName,
          arcadeTableState.tableType,
          1000,
        )

      const audio = arcadeTable.FindFirstChild('Audio') as
        | { ScorerSound?: Sound }
        | undefined
      if (audio?.ScorerSound) playSoundId(part, audio.ScorerSound.SoundId)

      task.wait(0.5)
      part.Material = Enum.Material.Plastic
    })
  }
}
