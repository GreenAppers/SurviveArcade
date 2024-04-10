import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { Players } from '@rbxts/services'
import { playSoundId } from 'ReplicatedStorage/shared/assets/sounds/play-sound'
import { BouncerTag } from 'ReplicatedStorage/shared/constants/tags'
import { Events } from 'ServerScriptService/network'
import { GameService } from 'ServerScriptService/services/GameService'
import {
  getArcadeTableAndStateFromDescendent,
  getArcadeTableOwner,
} from 'ServerScriptService/utils'

@Component({ tag: BouncerTag })
export class BouncerComponent
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
      throw error('Bouncer has no ancestor ArcadeTable')

    part.Touched?.Connect((hit) => {
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
        | { BouncerSound?: Sound }
        | undefined
      if (audio?.BouncerSound) playSoundId(part, audio.BouncerSound.SoundId)

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
