import { Controller, OnStart } from '@flamework/core'
import { Players, ProximityPromptService } from '@rbxts/services'
import { selectTycoonsState } from 'ReplicatedStorage/shared/state'
import { findTycoonNameOwnedBy } from 'ReplicatedStorage/shared/state/TycoonState'
import { formatMessage, MESSAGE } from 'ReplicatedStorage/shared/utils/messages'
import { sendAlert } from 'StarterPlayer/StarterPlayerScripts/alerts'
import { PlayerController } from 'StarterPlayer/StarterPlayerScripts/controllers/PlayerController'
import { store } from 'StarterPlayer/StarterPlayerScripts/store'

@Controller()
export class ProximityController implements OnStart {
  tycoonsSelector = selectTycoonsState()

  constructor(private playerController: PlayerController) {}

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
            formatMessage(MESSAGE.QuestCommunicate, {
              playerName: player.Name,
            }),
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
        emoji: '🏗️',
        message: formatMessage(MESSAGE.TycoonNeeded),
      })
    }
  }

  onPhoneCall(proximityPrompt: ProximityPrompt, displayText: string) {
    proximityPrompt.Enabled = false
    this.playerController.playDialogAnimation(displayText)
    proximityPrompt.Enabled = true
  }
}
