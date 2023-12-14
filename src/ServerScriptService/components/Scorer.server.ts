import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { store } from 'ServerScriptService/store'
import {
  getArcadeTableOwner,
  getParentArcadeTable,
  playSound,
} from 'ServerScriptService/utils'

@Component({ tag: 'Scorer' })
export class MyComponent extends BaseComponent implements OnStart {
  onStart() {
    const part = this.instance as BasePart
    const arcadeTable = getParentArcadeTable(this.instance)

    part.Touched?.Connect((hit) => {
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
