import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { ScorerTag } from 'ReplicatedStorage/shared/constants/tags'
import { store } from 'ServerScriptService/store'
import {
  getArcadeTableFromDescendent,
  getArcadeTableOwner,
  playSound,
} from 'ServerScriptService/utils'

@Component({ tag: ScorerTag })
export class ScorerComponent
  extends BaseComponent<{}, BasePart>
  implements OnStart
{
  onStart() {
    const part = this.instance
    const arcadeTable = getArcadeTableFromDescendent(this.instance)
    if (!arcadeTable) throw error('Scorer has no ancestor ArcadeTable')

    part.Touched?.Connect((_hit) => {
      part.Material = Enum.Material.Neon

      const player = getArcadeTableOwner(arcadeTable)
      if (player) store.addScore(player.UserId, 1000)

      const audio = arcadeTable.FindFirstChild('Audio') as
        | { ScorerSound?: Sound }
        | undefined
      if (audio?.ScorerSound) playSound(part, audio.ScorerSound.SoundId)

      task.wait(0.5)
      part.Material = Enum.Material.Plastic
    })
  }
}
