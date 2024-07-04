import { OnStart, Service } from '@flamework/core'
import { Logger } from '@rbxts/log'
import { ProximityPromptService } from '@rbxts/services'
import { selectTycoonsState } from 'ReplicatedStorage/shared/state'
import { getArcadeCabinetFromDescendent } from 'ReplicatedStorage/shared/utils/arcade'
import { MapService } from 'ServerScriptService/services/MapService'
import { store } from 'ServerScriptService/store'
import { EXCHANGE, executeExchange } from 'ServerScriptService/utils/exchange'

@Service()
export class ProximityService implements OnStart {
  tycoonsSelector = selectTycoonsState()

  constructor(
    protected readonly logger: Logger,
    protected readonly mapService: MapService,
  ) {}

  onStart() {
    ProximityPromptService.PromptTriggered.Connect(
      (proximityPrompt, player) => {
        if (proximityPrompt.ObjectText === EXCHANGE.Coin.Name) {
          executeExchange(player.UserId, EXCHANGE.Coin)
        } else if (proximityPrompt.ObjectText === EXCHANGE.Popcorn.Name) {
          this.onPopcorn(player)
        } else if (proximityPrompt.ObjectText === 'Change Table') {
          const arcadeTable = getArcadeCabinetFromDescendent(proximityPrompt)
          if (arcadeTable) store.changeArcadeTable(arcadeTable.Name)
        }
      },
    )
  }

  onPopcorn(_player: Player) {}
}
