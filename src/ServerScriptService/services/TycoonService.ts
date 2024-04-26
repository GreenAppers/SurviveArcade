import { OnStart, Service } from '@flamework/core'
import Object from '@rbxts/object-utils'
import { Players, ReplicatedStorage, Workspace } from '@rbxts/services'
import { CURRENCY_EMOJIS } from 'ReplicatedStorage/shared/constants/core'
import {
  selectPlayerState,
  selectTycoonsState,
  selectTycoonState,
} from 'ReplicatedStorage/shared/state'
import { PlayerTycoon } from 'ReplicatedStorage/shared/state/PlayersState'
import { TycoonState } from 'ReplicatedStorage/shared/state/TycoonState'
import {
  getTycoonButtonCost,
  getTycoonButtonCurrency,
  isTycoonButtonDependencyMet,
} from 'ReplicatedStorage/shared/utils/tycoon'
import {
  getTycoonCFrame,
  MapService,
} from 'ServerScriptService/services/MapService'
import { store } from 'ServerScriptService/store'
import { getDescendentsWhichAre, setHidden } from 'ServerScriptService/utils'

@Service()
export class TycoonService implements OnStart {
  constructor(protected mapService: MapService) {}

  loadTycoon(
    tycoonName: TycoonName,
    state: TycoonState,
    playerTycoonState?: PlayerTycoon,
  ) {
    const map = this.mapService.getMap()
    const tycoon = this.loadTycoonTemplate(
      map.scale,
      tycoonName,
      playerTycoonState,
    )
    this.setupTycoon(tycoon, state, getTycoonCFrame(tycoonName))
    return tycoon
  }

  loadTycoonTemplate(
    tycoonType: TycoonType,
    tycoonName: TycoonName,
    playerState?: PlayerTycoon,
  ) {
    const tycoon = new Instance('Model')
    tycoon.Name = tycoonName
    tycoon.AddTag('Tycoon')
    tycoon.SetAttribute('TycoonType', tycoonType)

    const tycoonTemplate = ReplicatedStorage.Tycoons[tycoonType]
    const baseplate = tycoonTemplate.Baseplate.Clone()
    baseplate.Parent = tycoon
    const buttons = tycoonTemplate.Buttons.Clone()
    buttons.Parent = tycoon
    const items = new Instance('Folder')
    items.Name = 'Items'
    items.Parent = tycoon
    const mainItems = tycoonTemplate.MainItems.Clone()
    mainItems.Parent = tycoon.Clone()
    const purchases = tycoonTemplate.Purchases.Clone()
    purchases.Parent = tycoon

    for (const itemTemplate of tycoonTemplate.Items.GetChildren()) {
      if (!playerState?.buttons[itemTemplate.Name]) continue
      const item = itemTemplate.Clone()
      item.Parent = items
    }

    for (const button of buttons.GetChildren() as TycoonButtonModel[]) {
      if (playerState?.buttons[button.Name]) {
        button.Destroy()
        continue
      }
      const cost = getTycoonButtonCost(button)
      const currency = getTycoonButtonCurrency(button)
      if (cost && currency) {
        button.Button.BillboardGui.Frame.TextLabel.Text += ` ${CURRENCY_EMOJIS[currency]} ${cost}`
      }
      if (!isTycoonButtonDependencyMet(button, playerState?.buttons)) {
        setHidden(button, true)
      }
    }

    return tycoon as Tycoon
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
    const tycoon = game.Workspace.Tycoons?.FindFirstChild(name)
    tycoon?.Destroy()
    const workspaceMap = game.Workspace.Map
    const tycoonPlot = workspaceMap[name]
    const tycoonPlotTemplate =
      ReplicatedStorage.Maps[this.mapService.currentMap][name]
    const newTycoonPlot = tycoonPlotTemplate?.Clone()
    if (newTycoonPlot) newTycoonPlot.Parent = workspaceMap
    tycoonPlot?.Destroy()
    store.resetTycoon(name)
  }

  startTycoonClaimedSubscription() {
    store.subscribe(
      selectTycoonsState(),
      (tycoonsState, previousTycoonsState) => {
        for (const [tycoonName, tycoonState] of Object.entries(tycoonsState)) {
          const previousTycoonState = previousTycoonsState[tycoonName]
          if (tycoonState.owner === previousTycoonState?.owner) continue
          const owner = tycoonState.owner
            ? Players.GetPlayerByUserId(tycoonState.owner)
            : undefined
          this.onTycoonClaimed(tycoonName, owner)
          if (owner) {
            this.onPlayerClaimed(owner, tycoonName, tycoonState)
          } else if (previousTycoonState?.owner) {
            const previousOwner = Players.GetPlayerByUserId(
              previousTycoonState.owner,
            )
            if (previousOwner) this.onPlayerClaimed(previousOwner)
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
      const map = this.mapService.getMap()
      const state = store.getState()
      const playerState = selectPlayerState(player.UserId)(state)
      this.loadTycoon(
        name,
        selectTycoonState(name)(state),
        playerState?.tycoon[map.scale],
      )
    } else {
      this.resetTycoon(name)
    }
  }
}
