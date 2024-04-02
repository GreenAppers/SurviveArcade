import { Controller, OnStart } from '@flamework/core'
import {
  Players,
  ProximityPromptService,
  ReplicatedStorage,
} from '@rbxts/services'

@Controller()
export class ProximityController implements OnStart {
  onStart() {
    ProximityPromptService.PromptTriggered.Connect(
      (proximityPrompt, player) => {
        if (player.UserId !== Players.LocalPlayer.UserId) return
        if (proximityPrompt.ObjectText === 'Phone') {
          this.onPhoneCall(player, proximityPrompt)
        }
      },
    )
  }

  onPhoneCall(player: Player, proximityPrompt: ProximityPrompt) {
    proximityPrompt.Enabled = false
    const dialogGui = ReplicatedStorage.Guis.DialogGui.Clone()
    dialogGui.Frame.TextFrame.TextLabel.Text = `Hello ${player.Name}, I see you have learned to communicate.`
    // dialogGui.Frame.TextFrame.TextLabel.MaxVisibleGraphemes
    dialogGui.Parent = Players.LocalPlayer.FindFirstChild('PlayerGui')
    wait(5)
    dialogGui.Destroy()
    proximityPrompt.Enabled = true
  }
}
