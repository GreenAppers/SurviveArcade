import { Controller, OnStart } from '@flamework/core'
import {
  Players,
  ProximityPromptService,
  ReplicatedStorage,
} from '@rbxts/services'
import { TOOL_NAMES } from 'ReplicatedStorage/shared/constants/core'
import { selectTycoonsState } from 'ReplicatedStorage/shared/state'
import { formatMessage, MESSAGE } from 'ReplicatedStorage/shared/utils/messages'
import { PlayerController } from 'StarterPlayer/StarterPlayerScripts/controllers/PlayerController'
import {
  EXCHANGE,
  testExchange,
} from 'StarterPlayer/StarterPlayerScripts/utils/exchange'

@Controller()
export class ProximityController implements OnStart {
  tycoonsSelector = selectTycoonsState()

  constructor(private playerController: PlayerController) {}

  onStart() {
    ProximityPromptService.PromptTriggered.Connect(
      (proximityPrompt, player) => {
        if (player.UserId !== Players.LocalPlayer.UserId) return
        if (
          proximityPrompt.ObjectText === EXCHANGE.Phone.Name ||
          proximityPrompt.ObjectText === EXCHANGE.Communicator.Name
        ) {
          this.onPhoneCall(
            proximityPrompt,
            formatMessage(MESSAGE.QuestCommunicate, {
              playerName: player.Name,
            }),
          )
        } else if (proximityPrompt.ObjectText === EXCHANGE.Coin.Name) {
          testExchange(player.UserId, EXCHANGE.Coin)
        } else if (proximityPrompt.ObjectText === EXCHANGE.Popcorn.Name) {
          this.onPopcorn()
        }
      },
    )
  }

  onPhoneCall(proximityPrompt: ProximityPrompt, displayText: string) {
    proximityPrompt.Enabled = false
    this.playerController.playDialogAnimation(displayText)
    proximityPrompt.Enabled = true
  }

  onPopcorn() {
    const backpack = Players.LocalPlayer.FindFirstChild<Backpack>('Backpack')
    if (backpack && !backpack.FindFirstChild(TOOL_NAMES.Popcorn)) {
      const popcornBox = ReplicatedStorage.Tools.Popcorn.Clone()
      popcornBox.Parent = backpack
    }
  }
}
