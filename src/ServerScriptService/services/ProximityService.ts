import { OnStart, Service } from '@flamework/core'
import { ProximityPromptService } from '@rbxts/services'
import { CURRENCY_TYPES } from 'ReplicatedStorage/shared/constants/core'
import { selectTycoonsState } from 'ReplicatedStorage/shared/state'
import { findTycoonNameOwnedBy } from 'ReplicatedStorage/shared/state/TycoonState'
import { store } from 'ServerScriptService/store'

@Service()
export class ProximityController implements OnStart {
  tycoonsSelector = selectTycoonsState()

  onStart() {
    ProximityPromptService.PromptTriggered.Connect(
      (proximityPrompt, player) => {
        if (proximityPrompt.ObjectText === 'Coin') {
          this.onCoin(player)
        }
      },
    )
  }

  onCoin(player: Player) {
    if (
      findTycoonNameOwnedBy(
        this.tycoonsSelector(store.getState()),
        player.UserId,
      )
    ) {
      store.addPlayerCurrency(player.UserId, CURRENCY_TYPES.Dollars, 1)
    }
  }
}
