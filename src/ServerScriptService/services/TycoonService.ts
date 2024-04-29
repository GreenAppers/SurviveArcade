import { OnStart, Service } from '@flamework/core'
import { Logger } from '@rbxts/log'
import Object from '@rbxts/object-utils'
import { Players, ReplicatedStorage, Workspace } from '@rbxts/services'
import {
  CURRENCY_EMOJIS,
  TYCOON_ATTRIBUTES,
  TYCOON_CHILD,
  TYPE,
} from 'ReplicatedStorage/shared/constants/core'
import { TycoonTag } from 'ReplicatedStorage/shared/constants/tags'
import {
  selectPlayerState,
  selectTycoonsState,
  selectTycoonState,
} from 'ReplicatedStorage/shared/state'
import { PlayerTycoon } from 'ReplicatedStorage/shared/state/PlayersState'
import { TycoonState } from 'ReplicatedStorage/shared/state/TycoonState'
import { getCurrency } from 'ReplicatedStorage/shared/utils/currency'
import {
  isTycoonButtonDependencyMet,
  tycoonConstants,
} from 'ReplicatedStorage/shared/utils/tycoon'
import {
  getTycoonCFrame,
  MapService,
} from 'ServerScriptService/services/MapService'
import { store } from 'ServerScriptService/store'
import { getDescendentsWhichAre, setHidden } from 'ServerScriptService/utils'

@Service()
export class TycoonService implements OnStart {
  constructor(
    protected readonly logger: Logger,
    protected mapService: MapService,
  ) {}

  loadTycoon(
    tycoonName: TycoonName,
    state: TycoonState,
    playerTycoonState?: PlayerTycoon,
  ) {
    const map = this.mapService.getMap()
    this.logger.Info(
      `Loading ${map.scale} ${tycoonName} {@Buttons}`,
      playerTycoonState?.buttons ?? {},
    )
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
    const tycoon = new Instance(TYPE.Model)
    tycoon.Name = tycoonName
    tycoon.AddTag(TycoonTag)
    tycoon.SetAttribute(TYCOON_ATTRIBUTES.TycoonType, tycoonType)

    const tycoonTemplate = ReplicatedStorage.Tycoons[tycoonType]
    const baseplate = tycoonTemplate.Baseplate.Clone()
    baseplate.Parent = tycoon
    const buttons = tycoonTemplate.Buttons.Clone()
    buttons.Parent = tycoon
    const items = new Instance(TYPE.Folder)
    items.Name = TYCOON_CHILD.Items
    items.Parent = tycoon
    const mainItems = tycoonTemplate.MainItems.Clone()
    mainItems.Parent = tycoon
    const purchases = tycoonTemplate.Purchases.Clone()
    purchases.Parent = tycoon

    this.logger.Info(`Loading ${tycoonType} ${tycoonName} items`)
    for (const itemTemplate of tycoonTemplate.Items.GetChildren()) {
      if (!playerState?.buttons[itemTemplate.Name]) continue
      const item = itemTemplate.Clone()
      item.Parent = items
    }

    this.logger.Info(`Loading ${tycoonType} ${tycoonName} buttons`)
    const constants = tycoonConstants[tycoonType]
    const font = Font.fromEnum(Enum.Font.FredokaOne)
    for (const button of buttons.GetChildren() as TycoonButtonModel[]) {
      const details = constants.Buttons[button.Name]
      if (!details || playerState?.buttons[button.Name]) {
        button.Destroy()
        continue
      }

      const attachment = new Instance(TYPE.Attachment)
      attachment.Parent = button.Button

      const billboardGui = new Instance(TYPE.BillboardGui)
      billboardGui.Size = new UDim2(10, 0, 10, 0)

      const frame = new Instance(TYPE.Frame)
      frame.BackgroundTransparency = 1
      frame.Size = new UDim2(1, 0, 1, 0)
      frame.Parent = billboardGui

      const textLabel = new Instance(TYPE.TextLabel)
      textLabel.BackgroundTransparency = 1
      textLabel.FontFace = font
      textLabel.Size = new UDim2(1, 0, 0.4, 0)
      textLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
      textLabel.TextScaled = true
      textLabel.TextSize = 14
      textLabel.Parent = frame

      const uiStroke = new Instance(TYPE.UIStroke)
      uiStroke.Parent = textLabel
      billboardGui.Parent = button.Button

      const cost = details.Cost
      const currency = getCurrency(details.Currency)
      if (cost && currency) {
        textLabel.Text = `${details.Description} ${CURRENCY_EMOJIS[currency]} ${cost}`
      }

      const hidden = !isTycoonButtonDependencyMet(details, playerState?.buttons)
      if (hidden) setHidden(button, true)
    }

    return tycoon as Tycoon
  }

  setupTycoon(tycoon: Tycoon, state: TycoonState, cframe?: CFrame) {
    const parts = getDescendentsWhichAre(tycoon, 'BasePart') as BasePart[]
    for (const part of parts) {
      if (part.Name === TYCOON_CHILD.Baseplate) {
        tycoon.PrimaryPart = part
      }
    }
    if (cframe) tycoon.PivotTo(cframe)
    tycoon.Parent = Workspace.Tycoons
  }

  resetTycoon(name: TycoonName) {
    this.logger.Info(`Resetting ${name}`)
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
