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
          this.onPhoneCall(
            proximityPrompt,
            `Hello ${player.Name}, I see that you have learned to communicate.`,
          )
        }
      },
    )
  }

  onPhoneCall(
    proximityPrompt: ProximityPrompt,
    displayText: string,
    delayBetweenChars = 0.05,
  ) {
    proximityPrompt.Enabled = false
    const dialogGui = ReplicatedStorage.Guis.DialogGui.Clone()
    const textLabel = dialogGui.Frame.TextFrame.TextLabel
    textLabel.Text = displayText
    textLabel.MaxVisibleGraphemes = 0
    dialogGui.Parent = Players.LocalPlayer.FindFirstChild('PlayerGui')

    const wizard = dialogGui.Frame.CharacterFrame.ViewportFrame.Wizard
    const animator = wizard.Humanoid.Animator
    const wizardTalk = animator.LoadAnimation(wizard.Talk)
    wizardTalk.Play()

    let index = 0
    for (const [_first, _last] of utf8.graphemes(displayText)) {
      index += 1
      textLabel.MaxVisibleGraphemes = index
      task.wait(delayBetweenChars)
    }

    task.wait(2)
    dialogGui.Destroy()
    proximityPrompt.Enabled = true
  }
}
