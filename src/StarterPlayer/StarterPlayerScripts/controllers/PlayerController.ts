import { Controller, OnStart } from '@flamework/core'
import { DeviceType } from '@rbxts/device'
import Object from '@rbxts/object-utils'
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
} from 'ReplicatedStorage/shared/state'
import {
  GravityController,
  gravityControllerClass,
} from 'ReplicatedStorage/shared/utils/gravity'
import { sendAlert } from 'StarterPlayer/StarterPlayerScripts/alerts'
import { ArcadeController } from 'StarterPlayer/StarterPlayerScripts/controllers/ArcadeController'
import { store } from 'StarterPlayer/StarterPlayerScripts/store'
import { forEveryPlayerCharacterAdded } from 'StarterPlayer/StarterPlayerScripts/utils'

@Controller({})
export class PlayerController implements OnStart {
  collectionPlaying = false
  gravityController: GravityController | undefined
  isDesktop = USER_DEVICE === DeviceType.Desktop
  isSeated = false
  runSpeed = 32
  walkSpeed = 16

  constructor(private arcadeController: ArcadeController) {}

  onStart() {
    if (this.isDesktop)
      StarterGui.SetCoreGuiEnabled(Enum.CoreGuiType.PlayerList, false)

    const player = Players.LocalPlayer
    this.startInputHandling()
    this.startMyRespawnHandler(player)
    this.startMyGuideHandler(player)
    this.prepareGravityController(player)
    this.startCollectionAnimation(player)

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
      sendAlert({
        emoji: '👼',
        message: 'Get the high score.  But beware of the rats!',
      })
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

  startCollectionAnimation(player: Player) {
    store.subscribe(
      selectPlayerState(player.UserId),
      (playerData, previousPlayerData) => {
        if (playerData?.levity !== previousPlayerData?.levity)
          this.playCollectionAnimation(CURRENCY_EMOJIS.Levity)
        if (playerData?.dollars !== previousPlayerData?.dollars)
          this.playCollectionAnimation(CURRENCY_EMOJIS.Dollars)
        if (playerData?.tickets !== previousPlayerData?.tickets)
          this.playCollectionAnimation(CURRENCY_EMOJIS.Tickets)
      },
    )
  }

  playCollectionAnimation(text?: string) {
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
        Position: new UDim2(1.0, 0, 0.5, 0),
      })
      tween.Play()
    })
    collectGui.Enabled = true
    wait(0.7)
    collectGui.Enabled = false
    this.collectionPlaying = false
  }

  refreshBeams(guideEnabled?: boolean) {
    this.arcadeController.refreshBeams(
      selectArcadeTablesState()(store.getState()),
      guideEnabled,
    )
  }
}
