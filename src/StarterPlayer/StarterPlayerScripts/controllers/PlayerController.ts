import { Controller, OnStart } from '@flamework/core'
import { DeviceType } from '@rbxts/device'
import {
  Players,
  ReplicatedStorage,
  StarterGui,
  TweenService,
  UserInputService,
} from '@rbxts/services'
import {
  CURRENCY_EMOJIS,
  USER_DEVICE,
} from 'ReplicatedStorage/shared/constants/core'
import {
  selectArcadeTablesState,
  selectLocalPlayerGroundArcadeTableName,
  selectLocalPlayerState,
  selectPlayerGuideEnabled,
  selectPlayerState,
  selectTycoonsState,
} from 'ReplicatedStorage/shared/state'
import { findTycoonNameOwnedBy } from 'ReplicatedStorage/shared/state/TycoonState'
import {
  GravityController,
  gravityControllerClass,
} from 'ReplicatedStorage/shared/utils/gravity'
import { sendAlert } from 'StarterPlayer/StarterPlayerScripts/alerts'
import { ArcadeController } from 'StarterPlayer/StarterPlayerScripts/controllers/ArcadeController'
import { TycoonController } from 'StarterPlayer/StarterPlayerScripts/controllers/TycoonController'
import { calculateRem } from 'StarterPlayer/StarterPlayerScripts/fonts'
import { store } from 'StarterPlayer/StarterPlayerScripts/store'
import { forEveryPlayerCharacterAdded } from 'StarterPlayer/StarterPlayerScripts/utils'

@Controller({})
export class PlayerController implements OnStart {
  collectionPlaying = false
  firstRespawn = true
  gravityController: GravityController | undefined
  isDesktop = USER_DEVICE === DeviceType.Desktop
  isSeated = false
  runSpeed = 32
  walkSpeed = 16

  constructor(
    private arcadeController: ArcadeController,
    private tycoonController: TycoonController,
  ) {}

  onStart() {
    if (this.isDesktop)
      StarterGui.SetCoreGuiEnabled(Enum.CoreGuiType.PlayerList, false)

    const player = Players.LocalPlayer
    this.startInputHandling()
    this.startMyRespawnHandler(player)
    this.startMyGuideHandler(player)
    this.prepareGravityController(player)
    this.startCollectionAnimator(player)

    const playerGuideEnabledSelector = selectPlayerGuideEnabled(player.UserId)
    while (task.wait(1)) {
      const state = store.getState()
      this.refreshBeams(playerGuideEnabledSelector(state))
    }
  }

  startInputHandling() {
    UserInputService.InputBegan.Connect((inputObject) => {
      if (inputObject.KeyCode === Enum.KeyCode.LeftShift) {
        // Sprint started
        const player = Players.LocalPlayer
        const humanoid = (<PlayerCharacter>player.Character)?.Humanoid
        const camera = game.Workspace.CurrentCamera
        if (!this.arcadeController.myArcadeTableName) {
          if (humanoid && humanoid.WalkSpeed > 0)
            humanoid.WalkSpeed = this.runSpeed
          if (camera) camera.FieldOfView = 60
        }
      } else if (inputObject.KeyCode === Enum.KeyCode.Tab && this.isDesktop) {
        // Toggle playerlist
        const playerListEnabled = StarterGui.GetCoreGuiEnabled(
          Enum.CoreGuiType.PlayerList,
        )
        StarterGui.SetCoreGuiEnabled(
          Enum.CoreGuiType.PlayerList,
          !playerListEnabled,
        )
      }
    })

    UserInputService.InputEnded.Connect((inputObject) => {
      if (inputObject.KeyCode === Enum.KeyCode.LeftShift) {
        // Sprint stopped
        const player = Players.LocalPlayer
        const humanoid = (<PlayerCharacter>player.Character)?.Humanoid
        const camera = game.Workspace.CurrentCamera
        if (humanoid && humanoid.WalkSpeed > 0)
          humanoid.WalkSpeed = this.walkSpeed
        if (camera) camera.FieldOfView = 70
      }
    })
  }

  startMyRespawnHandler(player: Player) {
    const playerGuideEnabledSelector = selectPlayerGuideEnabled(player.UserId)
    const handleRespawn = (playerCharacter: Model) => {
      const beam = ReplicatedStorage.Common.Beam.Clone()
      beam.Parent = playerCharacter

      if (this.firstRespawn) {
        this.firstRespawn = false
        this.playDialogAnimation(
          `Welcome ${player.Name}.  The veil between arcades grows thin.  You must find the way to the high score.  But beware of the rats!`,
        )
      } else {
        sendAlert({
          emoji: '👼',
          message: 'Get the high score.  But beware of the rats!',
        })
      }
      const state = store.getState()
      this.refreshBeams(playerGuideEnabledSelector(state))
    }
    player.CharacterAdded.Connect(handleRespawn)
    if (player.Character) handleRespawn(player.Character)
  }

  startMyGuideHandler(player: Player) {
    const arcadeTablesSelector = selectArcadeTablesState()
    const playerGuideEnabledSelector = selectPlayerGuideEnabled(player.UserId)
    store.subscribe(arcadeTablesSelector, (_arcadeTablesState) => {
      this.refreshBeams(playerGuideEnabledSelector(store.getState()))
    })
    store.subscribe(playerGuideEnabledSelector, (guideEnabled) => {
      this.refreshBeams(guideEnabled)
    })
  }

  prepareGravityController(player: Player) {
    forEveryPlayerCharacterAdded(player, (character) => {
      this.disableGravityController()
      const humanoid = <Humanoid>character.WaitForChild('Humanoid')
      humanoid?.Seated?.Connect((seated) => {
        this.isSeated = seated
        if (seated) this.disableGravityController()
        else this.enableGravityController()
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
        if (playerData.levity !== previousPlayerData.levity)
          this.playCollectionAnimation(
            CURRENCY_EMOJIS.Levity,
            game.Workspace.CurrentCamera
              ? calculateRem(game.Workspace.CurrentCamera.ViewportSize) * 8
              : 0,
          )
        if (playerData.dollars !== previousPlayerData.dollars)
          this.playCollectionAnimation(CURRENCY_EMOJIS.Dollars)
        if (playerData.tickets !== previousPlayerData.tickets) {
          sendAlert({
            emoji: '🎟️',
            message: `You won ${
              playerData.tickets - previousPlayerData.tickets
            } tickets!`,
          })
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
      'PlayerGui',
    )?.FindFirstChild('CollectGui') as CollectGui | undefined
    if (!collectGui) return
    if (this.collectionPlaying) return
    this.collectionPlaying = true
    const tweenInfo = new TweenInfo(0.8, Enum.EasingStyle.Linear)
    ;(collectGui.Frame.GetChildren() as TextLabel[]).forEach((child) => {
      if (text) child.Text = text
      child.Position = child.GetAttribute('StartPosition') as UDim2
      const tween = TweenService.Create(child, tweenInfo, {
        Position: new UDim2(1.0, 0, 0.5, yOffset),
      })
      tween.Play()
    })
    collectGui.Enabled = true
    wait(0.7)
    collectGui.Enabled = false
    this.collectionPlaying = false
  }

  playDialogAnimation(displayText: string, delayBetweenChars = 0.05) {
    const dialogGui = ReplicatedStorage.Guis.DialogGui.Clone()
    const textLabel = dialogGui.Frame.TextFrame.TextLabel
    textLabel.Text = displayText
    textLabel.MaxVisibleGraphemes = 0
    dialogGui.Parent = Players.LocalPlayer.FindFirstChild('PlayerGui')

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

  refreshBeams(guideEnabled?: boolean) {
    const localPlayer = Players.LocalPlayer
    const playerCharacter = <PlayerCharacter | undefined>localPlayer?.Character
    const beam = playerCharacter?.FindFirstChild('Beam') as Beam | undefined
    const humanoid = <Humanoid | undefined>(
      playerCharacter?.FindFirstChild('Humanoid')
    )
    if (!playerCharacter || !humanoid || !beam) return

    // Clear old beam
    beam.Enabled = false

    // Check if player is alive and has guide enabled.
    if (!guideEnabled || !humanoid.Health || humanoid.Sit) return
    const localPlayerTeamName =
      localPlayer?.Team?.Name === 'Unclaimed Team'
        ? undefined
        : localPlayer?.Team?.Name

    // Find the local player's RootRigAttachment.
    const humanoidRootPart = <BasePart | undefined>(
      playerCharacter.FindFirstChild('HumanoidRootPart')
    )
    if (!playerCharacter || !humanoidRootPart) return
    const rootRigAttachment = <Attachment | undefined>(
      humanoidRootPart.FindFirstChild('RootRigAttachment')
    )
    if (!rootRigAttachment) return

    // Check player state
    const state = store.getState()
    const playerState = selectPlayerState(localPlayer.UserId)(state)
    const tycoonsState = selectTycoonsState()(state)
    const tycoonName = findTycoonNameOwnedBy(tycoonsState, localPlayer.UserId)

    // Plan next action
    let status = ''
    let targetAttachment
    if (!tycoonName) {
      status = 'Claim a tycoon'
      targetAttachment = this.tycoonController.findTycoonTarget(
        tycoonsState,
        humanoidRootPart,
        rootRigAttachment,
      )
      // } else if (false) {
      //   status = 'Build your tycoon'
    } else if ((playerState?.dollars ?? 0) <= 0) {
      status = 'Find coins'
      targetAttachment = this.arcadeController.findCoinTarget(
        humanoidRootPart.Position,
      )
    } else {
      status = 'Win tickets'
      targetAttachment = this.arcadeController.findTableTarget(
        selectArcadeTablesState()(state),
        humanoidRootPart,
        rootRigAttachment,
        localPlayerTeamName,
      )
    }

    if (status !== '') store.setGuideText(status)
    if (!targetAttachment) return
    beam.Attachment0 = rootRigAttachment
    beam.Attachment1 = targetAttachment
    beam.Enabled = true
  }
}
