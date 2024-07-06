import { Controller, OnStart } from '@flamework/core'
import { BehaviorTree3, BehaviorTreeCreator } from '@rbxts/behavior-tree-5'
import { CmdrClient } from '@rbxts/cmdr'
import { DeviceType } from '@rbxts/device'
import { Logger } from '@rbxts/log'
import {
  Players,
  ReplicatedStorage,
  RunService,
  StarterGui,
  TweenService,
  UserInputService,
  Workspace,
} from '@rbxts/services'
import {
  CHARACTER_CHILD,
  COLLECT_GUI_ATTRIBUTES,
  CURRENCY_EMOJIS,
  CURRENCY_TYPES,
  HUMANOID_ROOT_PART_CHILD,
  PLAYER_CHILD,
  PLAYER_GUI_CHILD,
  TEAM_NAMES,
  USER_DEVICE,
} from 'ReplicatedStorage/shared/constants/core'
import VALUES from 'ReplicatedStorage/shared/constants/values.json'
import {
  selectArcadeTablesState,
  selectLocalPlayerGroundArcadeTableName,
  selectLocalPlayerState,
  selectPlayerCurrency,
  selectPlayerGuideEnabled,
  selectPlayerState,
} from 'ReplicatedStorage/shared/state'
import { BehaviorObject } from 'ReplicatedStorage/shared/utils/behavior'
import {
  GravityController,
  gravityControllerClass,
} from 'ReplicatedStorage/shared/utils/gravity'
import {
  formatMessage,
  joinMessage,
  MESSAGE,
} from 'ReplicatedStorage/shared/utils/messages'
import { sendAlert } from 'StarterPlayer/StarterPlayerScripts/alerts'
import { ShooterComponent } from 'StarterPlayer/StarterPlayerScripts/components/Shooter'
import { ArcadeController } from 'StarterPlayer/StarterPlayerScripts/controllers/ArcadeController'
import { calculateRem } from 'StarterPlayer/StarterPlayerScripts/fonts'
import { store } from 'StarterPlayer/StarterPlayerScripts/store'
import { forEveryPlayerCharacterAdded } from 'StarterPlayer/StarterPlayerScripts/utils/player'

@Controller({})
export class PlayerController implements OnStart {
  firstRespawn = true
  collectionAnimationPlaying = false
  playerSpace: PlayerSpace | undefined
  guide: BehaviorTree3<BehaviorObject> | undefined
  guideObject: BehaviorObject = { Blackboard: {}, treeRunning: false }
  gravityController: GravityController | undefined
  shooter: ShooterComponent | undefined
  isDesktop = USER_DEVICE === DeviceType.Desktop
  isSeated = false
  isShooting = false
  runSpeed = 32
  walkSpeed = 16

  constructor(
    protected arcadeController: ArcadeController,
    protected logger: Logger,
  ) {}

  onStart() {
    if (this.isDesktop)
      StarterGui.SetCoreGuiEnabled(Enum.CoreGuiType.PlayerList, false)

    CmdrClient.SetActivationKeys([Enum.KeyCode.F2])

    const player = Players.LocalPlayer
    game.Workspace.Cutscenes.LoadedClient.Event.Connect(() =>
      this.handleLoaded(player),
    )
    this.startInputHandling()
    this.startMyRespawnHandler(player)
    this.startMyGuideHandler(player)
    this.startGravityController(player)
    this.startCollectionAnimator(player)

    const playerGuideEnabledSelector = selectPlayerGuideEnabled(player.UserId)
    while (task.wait(0.5)) {
      const state = store.getState()
      this.updateGuide(playerGuideEnabledSelector(state))
    }
  }

  getPlayerSpace() {
    if (this.playerSpace) return this.playerSpace
    const key = `${Players.LocalPlayer.UserId}`
    const playerSpace = Workspace.PlayerSpaces.WaitForChild<PlayerSpace>(key)
    if (!playerSpace) throw 'Player space not found'
    this.playerSpace = playerSpace
    return playerSpace
  }

  equipShooter(shooter: ShooterComponent | undefined) {
    this.shooter = shooter
    this.isShooting = false
  }

  startInputHandling() {
    UserInputService.InputBegan.Connect((inputObject, gameHandledEvent) => {
      if (inputObject.KeyCode === Enum.KeyCode.LeftShift) {
        // Sprint started
        const player = Players.LocalPlayer
        const humanoid = (player.Character as PlayerCharacter)?.Humanoid
        const camera = game.Workspace.CurrentCamera
        if (!this.arcadeController.myArcadeTableName) {
          if (humanoid && humanoid.WalkSpeed > 0)
            humanoid.WalkSpeed = this.runSpeed
          if (camera) camera.FieldOfView = 60
        }
      } else if (inputObject.KeyCode === Enum.KeyCode.Tab && this.isDesktop) {
        // Toggle playerlist
        const useCoreGuiPlayerList = false
        if (useCoreGuiPlayerList) {
          const playerListEnabled = StarterGui.GetCoreGuiEnabled(
            Enum.CoreGuiType.PlayerList,
          )
          StarterGui.SetCoreGuiEnabled(
            Enum.CoreGuiType.PlayerList,
            !playerListEnabled,
          )
        } else {
          store.togglePlayerList()
        }
      } else if (
        inputObject.UserInputType === Enum.UserInputType.MouseButton1 &&
        this.shooter &&
        !gameHandledEvent
      ) {
        this.isShooting = true
      }
    })

    UserInputService.InputEnded.Connect((inputObject, gameHandledEvent) => {
      if (inputObject.KeyCode === Enum.KeyCode.LeftShift) {
        // Sprint stopped
        const player = Players.LocalPlayer
        const humanoid = (player.Character as PlayerCharacter)?.Humanoid
        const camera = game.Workspace.CurrentCamera
        if (humanoid && humanoid.WalkSpeed > 0)
          humanoid.WalkSpeed = this.walkSpeed
        if (camera) camera.FieldOfView = 70
      } else if (
        inputObject.UserInputType === Enum.UserInputType.MouseButton1 &&
        this.shooter &&
        !gameHandledEvent
      ) {
        this.isShooting = false
      }
    })

    RunService.Stepped.Connect(() => {
      if (this.isShooting && this.shooter && this.shooter.mouse) {
        this.shooter.instance.MouseEvent.FireServer(
          this.shooter.mouse.Hit.Position,
        )
      }
    })
  }

  startMyRespawnHandler(player: Player) {
    player.CharacterAdded.Connect((character) =>
      this.handleRespawn(player, character),
    )
    if (player.Character) this.handleRespawn(player, player.Character)
  }

  handleRespawn(player: Player, playerCharacter: Model) {
    const playerGuideEnabledSelector = selectPlayerGuideEnabled(player.UserId)
    const beam = ReplicatedStorage.Common.Beam.Clone()
    beam.Name = CHARACTER_CHILD.GuideBeam
    beam.Parent = playerCharacter
    const state = store.getState()
    if (this.firstRespawn) {
      this.firstRespawn = false
    } else {
      sendAlert({
        emoji: '👼',
        message: formatMessage(MESSAGE.GameRespawn),
      })
    }
    this.updateGuide(playerGuideEnabledSelector(state))
  }

  handleLoaded(player: Player) {
    const playerDollarsSelector = selectPlayerCurrency(
      player.UserId,
      CURRENCY_TYPES.Dollars,
    )
    const state = store.getState()
    const playerDollars = playerDollarsSelector(state)
    this.playDialogAnimation(
      joinMessage(
        formatMessage(MESSAGE.GameWelcome, { playerName: player.Name }),
        playerDollars < VALUES.GameWelcomeDollars.Value
          ? formatMessage(MESSAGE.GameWelcomeDollars, {
              dollars: VALUES.GameWelcomeDollars.Value,
            })
          : '',
      ),
    )
  }

  startMyGuideHandler(player: Player) {
    this.guide = BehaviorTreeCreator.Create<BehaviorObject>(
      ReplicatedStorage.BehaviorTrees.Player,
    )
    const arcadeTablesSelector = selectArcadeTablesState()
    const playerGuideEnabledSelector = selectPlayerGuideEnabled(player.UserId)
    store.subscribe(arcadeTablesSelector, (_arcadeTablesState) => {
      this.updateGuide(playerGuideEnabledSelector(store.getState()))
    })
    store.subscribe(playerGuideEnabledSelector, (guideEnabled) => {
      this.updateGuide(guideEnabled)
    })
  }

  startGravityController(player: Player) {
    forEveryPlayerCharacterAdded(player, (character) => {
      this.disableGravityController()
      const humanoid = character.WaitForChild<Humanoid>(
        CHARACTER_CHILD.Humanoid,
      )
      humanoid?.Seated?.Connect((seated) => {
        this.isSeated = seated
        if (seated) this.disableGravityController()
        else if (store.getState(selectLocalPlayerGroundArcadeTableName()))
          this.enableGravityController()
      })
    })
    store.subscribe(
      selectLocalPlayerGroundArcadeTableName(),
      (groudArcadeTableName) => {
        if (!groudArcadeTableName) this.disableGravityController()
      },
    )
  }

  disableGravityController() {
    if (!this.gravityController) return
    this.gravityController.Destroy()
    this.gravityController = undefined
  }

  enableGravityController() {
    if (this.gravityController) return
    const gravityController = new gravityControllerClass(Players.LocalPlayer)
    const localPlayerStateSelector = selectLocalPlayerState()
    gravityController.GetGravityUp = (_, oldGravityUp) => {
      const localPlayerState = localPlayerStateSelector(store.getState())
      return localPlayerState?.gravityUp || oldGravityUp
    }
    this.gravityController = gravityController
  }

  startCollectionAnimator(player: Player) {
    store.subscribe(
      selectPlayerState(player.UserId),
      (playerData, previousPlayerData) => {
        if (!playerData || !previousPlayerData) return
        if (playerData.levity > previousPlayerData.levity) {
          game.Workspace.Audio.CollectLevity.Play()
          this.playCollectionAnimation(
            CURRENCY_EMOJIS.Levity,
            game.Workspace.CurrentCamera
              ? calculateRem(game.Workspace.CurrentCamera.ViewportSize) * 8
              : 0,
          )
        }
        if (playerData.dollars > previousPlayerData.dollars) {
          game.Workspace.Audio.CollectDollars.Play()
          this.playCollectionAnimation(CURRENCY_EMOJIS.Dollars)
        }
        if (playerData.tickets > previousPlayerData.tickets) {
          sendAlert({
            emoji: '🎟️',
            message: formatMessage(MESSAGE.TicketsWon, {
              tickets: playerData.tickets - previousPlayerData.tickets,
            }),
          })
          game.Workspace.Audio.CollectTickets.Play()
          this.playCollectionAnimation(
            CURRENCY_EMOJIS.Tickets,
            game.Workspace.CurrentCamera
              ? -calculateRem(game.Workspace.CurrentCamera.ViewportSize) * 8
              : 0,
          )
        }
      },
    )
  }

  playCollectionAnimation(text?: string, yOffset = 0) {
    const collectGui = Players.LocalPlayer.FindFirstChild(
      PLAYER_CHILD.PlayerGui,
    )?.FindFirstChild<CollectGui>(PLAYER_GUI_CHILD.CollectGui)
    if (!collectGui) return
    if (this.collectionAnimationPlaying) return
    this.collectionAnimationPlaying = true
    const tweenInfo = new TweenInfo(0.8, Enum.EasingStyle.Linear)
    collectGui.Frame.GetChildren<TextLabel>().forEach((child) => {
      if (text) child.Text = text
      child.Position = child.GetAttribute(
        COLLECT_GUI_ATTRIBUTES.StartPosition,
      ) as UDim2
      const tween = TweenService.Create(child, tweenInfo, {
        Position: new UDim2(1.0, 0, 0.5, yOffset),
      })
      tween.Play()
    })
    collectGui.Enabled = true
    wait(0.7)
    collectGui.Enabled = false
    this.collectionAnimationPlaying = false
  }

  playDialogAnimation(
    displayText: string,
    delayBetweenChars = 2.4 / displayText.size(),
  ) {
    const dialogGui = ReplicatedStorage.Guis.DialogGui.Clone()
    const textLabel = dialogGui.Frame.TextFrame.TextLabel
    textLabel.Text = displayText
    textLabel.MaxVisibleGraphemes = 0
    dialogGui.Parent = Players.LocalPlayer.FindFirstChild(
      PLAYER_CHILD.PlayerGui,
    )

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
  }

  updateGuide(guideEnabled?: boolean) {
    const localPlayer = Players.LocalPlayer
    const playerCharacter = localPlayer?.Character as
      | PlayerCharacter
      | undefined
    const beam = playerCharacter?.FindFirstChild<Beam>(
      CHARACTER_CHILD.GuideBeam,
    )
    const humanoid = playerCharacter?.FindFirstChild<Humanoid>(
      CHARACTER_CHILD.Humanoid,
    )
    if (!playerCharacter || !humanoid || !beam) return

    // Clear old beam
    beam.Enabled = false

    // Check if player is alive and has guide enabled.
    if (!this.guide || !guideEnabled || !humanoid.Health || humanoid.Sit) return

    // Find the local player's RootRigAttachment.
    const humanoidRootPart = playerCharacter.FindFirstChild<BasePart>(
      CHARACTER_CHILD.HumanoidRootPart,
    )
    if (!playerCharacter || !humanoidRootPart) return
    const rootRigAttachment = humanoidRootPart.FindFirstChild<Attachment>(
      HUMANOID_ROOT_PART_CHILD.RootRigAttachment,
    )
    if (!rootRigAttachment) return

    const state = store.getState()
    const localPlayerState = selectLocalPlayerState()(state)

    // Run behavior tree
    this.guideObject.Blackboard = {
      sourceAttachment: rootRigAttachment,
      sourceHumanoidRootPart: humanoidRootPart,
      sourceInstance: playerCharacter,
      sourceSpawnNumber: localPlayerState?.KOd,
      sourceTeamName:
        localPlayer?.Team?.Name === TEAM_NAMES.UnclaimedTeam
          ? undefined
          : localPlayer?.Team?.Name,
      sourceUserId: localPlayer.UserId,
      state,
    }

    try {
      this.guide.run(this.guideObject)
    } catch (e) {
      this.logger.Warn(`Error running guide behavior tree: ${e}`)
    }

    // Apply result
    const { status, targetAttachment } = this.guideObject.Blackboard
    if (status) store.setGuideText(status)
    if (!targetAttachment) return
    beam.Attachment0 = rootRigAttachment
    beam.Attachment1 = targetAttachment
    beam.Enabled = true
  }
}
