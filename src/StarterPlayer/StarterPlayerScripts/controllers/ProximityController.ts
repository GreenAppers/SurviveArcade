import { Controller, OnStart } from '@flamework/core'
import {
  Players,
  ProximityPromptService,
  ReplicatedStorage,
} from '@rbxts/services'
import { selectTycoonsState } from 'ReplicatedStorage/shared/state'
import { findTycoonNameOwnedBy } from 'ReplicatedStorage/shared/state/TycoonState'
import { sendAlert } from 'StarterPlayer/StarterPlayerScripts/alerts'
import { store } from 'StarterPlayer/StarterPlayerScripts/store'

@Controller()
export class ProximityController implements OnStart {
  tycoonsSelector = selectTycoonsState()

  onStart() {
    ProximityPromptService.PromptTriggered.Connect(
      (proximityPrompt, player) => {
        if (player.UserId !== Players.LocalPlayer.UserId) return
        if (
          proximityPrompt.ObjectText === 'Phone' ||
          proximityPrompt.ObjectText === 'Communicator'
        ) {
          this.onPhoneCall(
            proximityPrompt,
            `Hello ${player.Name}, I see that you have learned to communicate.`,
          )
        } else if (proximityPrompt.ObjectText === 'Coin') {
          this.onCoin()
        }
      },
    )
  }

  onCoin() {
    if (
      !findTycoonNameOwnedBy(
        this.tycoonsSelector(store.getState()),
        Players.LocalPlayer.UserId,
      )
    ) {
      sendAlert({
        message: `Claim a tycoon first!`,
      })
    }
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

    const wizard =
      dialogGui.Frame.CharacterFrame.ViewportFrame.WorldModel.Wizard
    const animator = wizard.Humanoid.Animator
    const wizardTalk = animator.LoadAnimation(wizard.Talk)
    wizardTalk.Play()

    let index = 0
    for (const [_first, _last] of utf8.graphemes(displayText)) {
      index += 1
      if (wizard.PrimaryPart)
        wizard.PrimaryPart.Anchored = !wizard.PrimaryPart.Anchored
      textLabel.MaxVisibleGraphemes = index
      task.wait(delayBetweenChars)
    }

    wizardTalk.Stop()
    task.wait(2)
    dialogGui.Destroy()
    proximityPrompt.Enabled = true
  }
}
