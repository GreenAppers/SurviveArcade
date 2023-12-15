import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { store } from 'ServerScriptService/store'
import {
  getArcadeTableOwner,
  getParentArcadeTable,
} from 'ServerScriptService/utils'

@Component({ tag: 'Drain' })
export class DrainComponent extends BaseComponent implements OnStart {
  onStart() {
    const drain = this.instance as BasePart
    const arcadeTable = getParentArcadeTable(this.instance)
    if (!arcadeTable) return

    drain.Touched?.Connect((part) => {
      if (part.Parent?.Name !== 'Balls') return

      const player = getArcadeTableOwner(arcadeTable)
      if (player) {
        store.resetScore(player.UserId)
        const character: (Model & { Humanoid?: Humanoid }) | undefined =
          player.Character
        if (character?.Humanoid) character.Humanoid.Health = 0
      }

      task.wait(0.5)
      part.Destroy()
    })
  }
}
