import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { Workspace } from '@rbxts/services'
import { BlockDestroyerTag } from 'ReplicatedStorage/shared/constants/tags'

@Component({ tag: BlockDestroyerTag })
export class LavaComponent
  extends BaseComponent<{}, BlockDestroyer>
  implements OnStart
{
  onStart() {
    const ignoreModelForMouse = Workspace.FindFirstChild(
      'IgnoreModelForMouse',
    ) as Folder

    this.instance.DestroyBlock.OnServerInvoke = (player, target) => {
      xpcall(
        () => {
          if (!typeIs(target, 'Instance') || !target.IsA('Part')) return
          if (target.Name !== 'Block') {
            player.Kick('Stop exploiting!')
            return false
          }

          const clonedSoundBlock = new Instance('Part')
          clonedSoundBlock.Size = new Vector3(3, 3, 3)
          clonedSoundBlock.CFrame = target.CFrame
          const clonedSound = Workspace.Audio.BlockDestroyed.Clone()
          clonedSound.Ended.Connect(() => clonedSoundBlock.Destroy())
          clonedSound.Parent = clonedSoundBlock
          clonedSoundBlock.Parent = ignoreModelForMouse
          clonedSound.Play()
          target.Destroy()
        },
        () => {
          player.Kick('Stop exploiting!')
        },
      )
    }
  }
}
