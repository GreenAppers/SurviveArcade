import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { Players, ReplicatedStorage, TeleportService } from '@rbxts/services'
import {
  HUMAN_PLACE_ID,
  START_PLACE_ID,
} from 'ReplicatedStorage/shared/constants/core'
import { TeleporterTag } from 'ReplicatedStorage/shared/constants/tags'
import { formatMessage, MESSAGE } from 'ReplicatedStorage/shared/utils/messages'

@Component({ tag: TeleporterTag })
export class TeleporterComponent
  extends BaseComponent<{ Destination?: string }, BasePart>
  implements OnStart
{
  debounce = false

  onStart() {
    this.instance.Touched?.Connect((hit) => {
      if (this.debounce) return
      const humanoid = hit.Parent?.FindFirstChild<Humanoid>('Humanoid')
      if (!humanoid) return
      const touchedPlayer = Players.GetPlayerFromCharacter(hit.Parent)
      if (touchedPlayer?.UserId === Players.LocalPlayer.UserId) {
        this.debounce = true

        let placeId = 0
        let message = ''
        switch (this.attributes.Destination) {
          case 'ElfMap':
            placeId = START_PLACE_ID
            message = formatMessage(MESSAGE.TeleportElf)
            break
          case 'HumanMap':
            placeId = HUMAN_PLACE_ID
            message = formatMessage(MESSAGE.TeleportHuman)
            break
        }
        if (placeId) {
          humanoid.WalkSpeed = 0
          humanoid.JumpPower = 0
          touchedPlayer.FindFirstChild('ForceField')?.Destroy()
          const forceField = new Instance('ForceField')
          forceField.Visible = true
          forceField.Parent = hit.Parent

          const playerGui = Players.LocalPlayer?.WaitForChild('PlayerGui')
          if (playerGui) {
            const gui = ReplicatedStorage.Guis.LoadingGui.Clone()
            gui.Parent = playerGui
            gui.MainFrame.Title.Text = message
            TeleportService.SetTeleportGui(gui)
          }

          TeleportService.Teleport(placeId, Players.LocalPlayer)
        }

        task.wait(5)
        this.debounce = false
      }
    })
  }
}
