import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { Players } from '@rbxts/services'
import { Events } from 'ServerScriptService/network'
import { store } from 'ServerScriptService/store'
import {
  getArcadeTableOwner,
  getParentArcadeTable,
  playSound,
} from 'ServerScriptService/utils'

@Component({ tag: 'Bouncer' })
export class BouncerComponent extends BaseComponent implements OnStart {
  onStart() {
    const part = this.instance as BasePart
    const arcadeTable = getParentArcadeTable(this.instance)
    if (!arcadeTable) return

    part.Touched?.Connect((hit) => {
      part.Material = Enum.Material.Neon

      const player = getArcadeTableOwner(arcadeTable)
      if (player) store.addScore(player.UserId, 1000)

      const audio = arcadeTable.FindFirstChild('Audio') as
        | { BouncerSound?: Sound }
        | undefined
      if (audio?.BouncerSound) playSound(part, audio.BouncerSound.SoundId)

      const humanoid = hit.Parent?.FindFirstChild('Humanoid') as
        | Humanoid
        | undefined
      if (humanoid) {
        const touchedPlayer = Players.GetPlayerFromCharacter(hit.Parent)
        if (touchedPlayer)
          Events.playerBounce.fire(touchedPlayer, part.Position)
      }

      task.wait(0.5)
      part.Material = Enum.Material.Plastic
    })
  }
}
