import { OnStart, Service } from '@flamework/core'
import { Logger } from '@rbxts/log'
import Object from '@rbxts/object-utils'
import { ReplicatedStorage, Workspace } from '@rbxts/services'
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
import {
  PlayerState,
  PlayerTycoon,
} from 'ReplicatedStorage/shared/state/PlayersState'
import {
  findTycoonNameOwnedBy,
  TycoonState,
  tycoonTemplateColor,
} from 'ReplicatedStorage/shared/state/TycoonState'
import { getCurrency } from 'ReplicatedStorage/shared/utils/currency'
import {
  findDescendentsWhichAre,
  setHidden,
} from 'ReplicatedStorage/shared/utils/instance'
import {
  getTycoonButtonColor,
  getTycoonType,
  isTycoonButtonDependencyMet,
  tycoonConstants,
} from 'ReplicatedStorage/shared/utils/tycoon'
import {
  getTycoonCFrame,
  MapService,
} from 'ServerScriptService/services/MapService'
import { store } from 'ServerScriptService/store'

@Service()
export class TycoonService implements OnStart {
  constructor(
    protected readonly logger: Logger,
    protected mapService: MapService,
  ) {}

  loadTycoon(
    tycoonName: TycoonName,
    tycoonState: TycoonState,
    playerTycoonState?: PlayerTycoon,
    playerState?: PlayerState,
  ) {
    const map = this.mapService.getMap()
    this.logger.Info(
      `Loading ${map.scale} ${tycoonName} {@Buttons}`,
      playerTycoonState?.buttons ?? {},
    )
    const tycoon = this.loadTycoonTemplate(
      map.scale,
      tycoonName,
      tycoonState,
      playerTycoonState,
      playerState,
    )
    this.setupTycoon(tycoon, tycoonState, getTycoonCFrame(tycoonName))
    return tycoon
  }

  loadTycoonTemplate(
    tycoonType: TycoonType,
    tycoonName: TycoonName,
    tycoonState: TycoonState,
    playerTycoonState?: PlayerTycoon,
    playerState?: PlayerState,
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
    for (const itemTemplate of tycoonTemplate.Items.GetChildren<Model>()) {
      if (!playerTycoonState?.buttons[itemTemplate.Name]) continue
      const item = itemTemplate.Clone()
      this.setupTycoonItem(item, tycoonState)
      item.Parent = items
    }

    this.logger.Info(`Loading ${tycoonType} ${tycoonName} buttons`)
    const constants = tycoonConstants[tycoonType]
    const font = Font.fromEnum(Enum.Font.FredokaOne)
    for (const button of buttons.GetChildren<TycoonButtonModel>()) {
      const details = constants.Buttons[button.Name]
      if (!details || playerTycoonState?.buttons[button.Name]) {
        button.Destroy()
        continue
      }

      const attachment = new Instance(TYPE.Attachment)
      attachment.CFrame = new CFrame(2, 0, 0)
      attachment.Parent = button.Button

      const billboardGui = new Instance(TYPE.BillboardGui)
      billboardGui.Size = new UDim2(10, 0, 3, 0)
      billboardGui.SizeOffset = new Vector2(0, 0.5)

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

      const hidden = !isTycoonButtonDependencyMet(
        details,
        playerTycoonState?.buttons,
      )
      if (hidden) setHidden(button, true)
      else
        button.Button.BrickColor = getTycoonButtonColor(
          playerState,
          currency,
          cost,
        )
    }

    return tycoon as Tycoon
  }

  setupTycoonItem(item: Model, state: TycoonState) {
    const parts = findDescendentsWhichAre(item, TYPE.BasePart) as BasePart[]
    for (const part of parts) {
      if (part.BrickColor.Name === tycoonTemplateColor.Name) {
        part.BrickColor = state.color
      }
    }
  }

  setupTycoon(tycoon: Tycoon, state: TycoonState, cframe?: CFrame) {
    const parts = findDescendentsWhichAre(tycoon, TYPE.BasePart) as BasePart[]
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
          this.onTycoonClaimed(tycoonName, owner)
          if (owner) {
            this.onPlayerClaimed(owner, tycoonName, tycoonState)
          } else if (previousTycoonState?.owner) {
            const previousOwner = previousTycoonState.owner
            if (previousOwner) this.onPlayerClaimed(previousOwner)
          }
        }
      },
    )
  }

  onStart() {
    this.startTycoonClaimedSubscription()
  }

  onPlayerStateChanged(
    player: Player,
    playerState: PlayerState,
    previousPlayerState: PlayerState,
  ) {
    const state = store.getState()
    const tycoonName = findTycoonNameOwnedBy(
      selectTycoonsState()(state),
      player.UserId,
    )
    if (
      !tycoonName ||
      (playerState.dollars === previousPlayerState.dollars &&
        playerState.tickets === previousPlayerState.tickets &&
        playerState.levity === previousPlayerState.levity)
    )
      return

    const tycoon = game.Workspace.Tycoons[tycoonName]
    const tycoonType = getTycoonType(
      tycoon?.GetAttribute(TYCOON_ATTRIBUTES.TycoonType),
    )
    if (!tycoon || !tycoonType) return

    const constants = tycoonConstants[tycoonType]
    for (const button of tycoon.Buttons.GetChildren<TycoonButtonModel>()) {
      if (button.Button.Transparency) continue
      const details = constants.Buttons[button.Name]
      button.Button.BrickColor = getTycoonButtonColor(
        playerState,
        getCurrency(details.Currency),
        details.Cost,
      )
    }
  }

  onPlayerClaimed(
    _userId: number,
    _tycoonName?: string,
    _tycoonState?: TycoonState,
  ) {}

  onTycoonClaimed(name: TycoonName, userId?: number) {
    if (userId) {
      const map = this.mapService.getMap()
      const state = store.getState()
      const playerState = selectPlayerState(userId)(state)
      this.loadTycoon(
        name,
        selectTycoonState(name)(state),
        playerState?.tycoon[map.scale],
        playerState,
      )
    } else {
      this.resetTycoon(name)
    }
  }
}
