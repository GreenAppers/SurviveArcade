import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import {
  Players,
  ReplicatedStorage,
  RunService,
  Workspace,
} from '@rbxts/services'
import { BlockDestroyerTag } from 'ReplicatedStorage/shared/constants/tags'
import { PlayerController } from 'StarterPlayer/StarterPlayerScripts/controllers/PlayerController'

@Component({ tag: BlockDestroyerTag })
export class BlockDestroyerComponent
  extends BaseComponent<BlockDestroyerAttributes, BlockDestroyer>
  implements OnStart
{
  constructor(protected playerController: PlayerController) {
    super()
  }

  onStart() {
    const ignoreModelForMouse = Workspace.WaitForChild(
      'IgnoreModelForMouse',
    ) as Folder
    const previewBlock = ReplicatedStorage.WaitForChild('PreviewBlock') as Part
    const buildingModel = Workspace.WaitForChild('BuildingModel') as Folder
    const mouse = Players.LocalPlayer.GetMouse()
    const tool = this.instance
    const selectionBox = previewBlock.WaitForChild(
      'SelectionBox',
    ) as SelectionBox
    const red = Color3.fromRGB(255, 0, 0)
    const character = Players.LocalPlayer.Character as PlayerCharacter
    const humanoid = character.Humanoid
    let connection: RBXScriptConnection | undefined
    let targetToDestory: BasePart | undefined
    let canUse = true

    mouse.TargetFilter = ignoreModelForMouse
    tool.Equipped.Connect(() => {
      selectionBox.Color3 = red
      connection = RunService.RenderStepped.Connect((_deltaTime) => {
        const mouseHit = mouse.Hit
        if (
          character.PrimaryPart &&
          mouseHit.Position.sub(character.PrimaryPart.Position).Magnitude <=
            this.attributes.MaxDistance &&
          humanoid.Health > 0 &&
          mouse.Target &&
          mouse.Target.Parent === buildingModel
        ) {
          previewBlock.CFrame = mouse.Target.CFrame
          previewBlock.Parent = ignoreModelForMouse
          targetToDestory = mouse.Target
        } else {
          previewBlock.Parent = ReplicatedStorage
          targetToDestory = undefined
        }
      })
    })
    tool.Unequipped.Connect(() => {
      connection?.Disconnect()
      previewBlock.Parent = ReplicatedStorage
    })
    tool.Activated.Connect(() => {
      if (!canUse || !targetToDestory) return
      canUse = false
      this.instance.DestroyBlock.InvokeServer(targetToDestory)
      previewBlock.Parent = ReplicatedStorage
      targetToDestory = undefined
      canUse = true
    })
  }
}
