import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { Players } from '@rbxts/services'
import { playSoundId } from 'ReplicatedStorage/shared/assets/sounds/play-sound'
import { BouncerTag } from 'ReplicatedStorage/shared/constants/tags'
import { selectArcadeTableState } from 'ReplicatedStorage/shared/state'
import { getArcadeTableFromDescendent } from 'ReplicatedStorage/shared/utils/arcade'
import { Events } from 'ServerScriptService/network'
import { ArcadeTableService } from 'ServerScriptService/services/ArcadeTableService'
import { store } from 'ServerScriptService/store'

@Component({ tag: BouncerTag })
export class BouncerComponent
  extends BaseComponent<{ BounceDiretion?: Vector3 }, BasePart>
  implements OnStart
{
  constructor(private arcadeTableService: ArcadeTableService) {
    super()
  }

  onStart() {
    const part = this.instance
    const arcadeTable = getArcadeTableFromDescendent(this.instance)
    if (!arcadeTable) throw error('Bouncer has no ancestor ArcadeTable')

    part.Touched?.Connect((hit) => {
      part.Material = Enum.Material.Neon

      const state = store.getState()
      const arcadeTableSelector = selectArcadeTableState(arcadeTable.Name)
      const arcadeTableState = arcadeTableSelector(state)
      const player = arcadeTableState?.owner

      if (player)
        this.arcadeTableService.addScore(
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
