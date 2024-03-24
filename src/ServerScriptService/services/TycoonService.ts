import { OnStart, Service } from '@flamework/core'
import Object from '@rbxts/object-utils'
import { ReplicatedStorage, Workspace } from '@rbxts/services'
import {
  selectTycoonsState,
  selectTycoonState,
} from 'ReplicatedStorage/shared/state'
import { TycoonState } from 'ReplicatedStorage/shared/state/TycoonState'
import { MapService } from 'ServerScriptService/services/MapService'
import { store } from 'ServerScriptService/store'
import { getDescendentsWhichAre } from 'ServerScriptService/utils'

@Service()
export class TycoonService implements OnStart {
  constructor(protected mapService: MapService) {}

  loadTycoon(tycoonName: TycoonName, state: TycoonState) {
    const map = this.mapService.getMap()
    const tycoon = this.loadTycoonTemplate(map.getTycoonType(), tycoonName)
    this.setupTycoon(tycoon, state, map.getTycoonCFrame(tycoonName))
    return tycoon
  }

  loadTycoonTemplate(tycoonType: TycoonType, tycoonName: TycoonName) {
    const tycoonTemplate = ReplicatedStorage.Tycoons[tycoonType]
    const tycoon = tycoonTemplate.Clone()
    tycoon.Name = tycoonName
    return tycoon
  }

  setupTycoon(tycoon: Tycoon, state: TycoonState, cframe?: CFrame) {
    const parts = getDescendentsWhichAre(tycoon, 'BasePart') as BasePart[]
    for (const part of parts) {
      if (part.Name === 'Baseplate') {
        tycoon.PrimaryPart = part
      }
    }
    if (cframe) tycoon.PivotTo(cframe)
    tycoon.Parent = Workspace.Tycoons
  }

  resetTycoon(name: TycoonName) {
    const tycoonsState = selectTycoonsState()(store.getState())
    const tycoonState = tycoonsState[name]
    const tycoon = <Tycoon>game.Workspace.Tycoons?.FindFirstChild(name)
    tycoon?.Destroy()
    store.resetTycoon(name)
  }

  startTycoonClaimedSubscription() {
    store.subscribe(
      selectTycoonsState(),
      (tycoonsState, previousTycoonsState) => {
        for (const [tycoonName, tycoonState] of Object.entries(tycoonsState)) {
          const previousTycoonState = previousTycoonsState[tycoonName]
          if (tycoonState.owner === previousTycoonState?.owner) continue
          this.onTycoonClaimed(tycoonName, tycoonState.owner)
          if (tycoonState.owner) {
            this.onPlayerClaimed(tycoonState.owner, tycoonName, tycoonState)
          } else if (previousTycoonState?.owner) {
            this.onPlayerClaimed(previousTycoonState.owner)
          }
        }
      },
    )
  }

  onStart() {
    this.startTycoonClaimedSubscription()
  }

  onPlayerClaimed(
    _player: Player,
    _tycoonName?: string,
    _tycoonState?: TycoonState,
  ) {}

  onTycoonClaimed(name: TycoonName, player?: Player) {
    if (player) {
      this.loadTycoon(name, selectTycoonState(name)(store.getState()))
    } else {
      this.resetTycoon(name)
    }
  }
}
