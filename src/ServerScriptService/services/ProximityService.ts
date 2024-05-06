import { OnStart, Service } from '@flamework/core'
import { ProximityPromptService } from '@rbxts/services'
import { selectTycoonsState } from 'ReplicatedStorage/shared/state'
import { EXCHANGE, executeExchange } from 'ServerScriptService/utils/exchange'

@Service()
export class ProximityService implements OnStart {
  tycoonsSelector = selectTycoonsState()

  onStart() {
    ProximityPromptService.PromptTriggered.Connect(
      (proximityPrompt, player) => {
        if (proximityPrompt.ObjectText === EXCHANGE.Coin.Name) {
          executeExchange(player.UserId, EXCHANGE.Coin)
        } else if (proximityPrompt.ObjectText === EXCHANGE.Popcorn.Name) {
          this.onPopcorn(player)
        }
      },
    )
  }

  onPopcorn(_player: Player) {}
}
