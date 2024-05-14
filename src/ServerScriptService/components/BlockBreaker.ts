import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { Workspace } from '@rbxts/services'
import { BlockBreakerTag } from 'ReplicatedStorage/shared/constants/tags'
import { PlayerService } from 'ServerScriptService/services/PlayerService'

@Component({ tag: BlockBreakerTag })
export class BlockBreakerComponent
  extends BaseComponent<{}, BlockBreaker>
  implements OnStart
{
  constructor(private playerService: PlayerService) {
    super()
  }

  onStart() {
    this.instance.BreakBlock.OnServerInvoke = (player, target) => {
      xpcall(
        () => {
          const playerSpace = this.playerService.getPlayerSpace(player)
          if (!typeIs(target, 'Instance') || !target.IsA('Part')) return
          if (target.Name !== 'Block') {
            player.Kick('Stop exploiting AAA! ' + target.Name)
            return false
          }
          const clonedSoundBlock = new Instance('Part')
          clonedSoundBlock.Size = new Vector3(3, 3, 3)
          clonedSoundBlock.CFrame = target.CFrame
          const clonedSound = Workspace.Audio.BlockBroken.Clone()
          clonedSound.Ended.Connect(() => clonedSoundBlock.Destroy())
          clonedSound.Parent = clonedSoundBlock
          clonedSoundBlock.Parent = playerSpace.PlaceBlockPreview
          clonedSound.Play()
          target.Destroy()
        },
        () => {
          player.Kick('Stop exploiting ZZZ!')
        },
      )
    }
  }
}
