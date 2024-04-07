import { Controller, OnStart } from '@flamework/core'
import { DeviceType } from '@rbxts/device'
import { Players, StarterGui, UserInputService } from '@rbxts/services'
import { USER_DEVICE } from 'ReplicatedStorage/shared/constants/core'
import {
  selectArcadeTablesState,
  selectLocalPlayerGroundArcadeTableName,
  selectLocalPlayerState,
  selectPlayerGuideEnabled,
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
  gravityController: GravityController | undefined
  isDesktop = USER_DEVICE === DeviceType.Desktop
  isSeated = false
  runSpeed = 32
  walkSpeed = 16

  constructor(private arcadeController: ArcadeController) {}

  onStart() {
    if (this.isDesktop)
      StarterGui.SetCoreGuiEnabled(Enum.CoreGuiType.PlayerList, false)
    this.startInputHandling()
    const player = Players.LocalPlayer
    this.startMyRespawnHandler(player)
    this.startMyGuideHandler(player)
    this.prepareGravityController(player)

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
      const beam = new Instance('Beam')
      beam.Name = 'Beam'
      beam.Texture = 'rbxassetid://17045937426'
      beam.TextureMode = Enum.TextureMode.Wrap
      beam.TextureLength = 3
      beam.TextureSpeed = 4
      beam.FaceCamera = true
      beam.Transparency = new NumberSequence(0.1)
      beam.Width0 = 1.5
      beam.Width1 = 1.5
      beam.Enabled = false
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

  refreshBeams(guideEnabled?: boolean) {
    this.arcadeController.refreshBeams(
      selectArcadeTablesState()(store.getState()),
      guideEnabled,
    )
  }
}
