import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { CollectionService } from '@rbxts/services'
import { BallTag, DrainTag } from 'ReplicatedStorage/shared/tags'
import { store } from 'ServerScriptService/store'
import {
  getArcadeTableFromDescendent,
  getArcadeTableOwner,
} from 'ServerScriptService/utils'

@Component({ tag: DrainTag })
export class DrainComponent extends BaseComponent implements OnStart {
  onStart() {
    const drain = this.instance as BasePart
    const arcadeTable = getArcadeTableFromDescendent(this.instance)
    if (!arcadeTable) throw error('Drain has no ancestor ArcadeTable')

    drain.Touched?.Connect((part) => {
      if (!CollectionService.HasTag(BallTag)) return

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
