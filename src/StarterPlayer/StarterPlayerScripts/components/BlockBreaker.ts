import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { Players, ReplicatedStorage, RunService } from '@rbxts/services'
import { BlockBreakerTag } from 'ReplicatedStorage/shared/constants/tags'
import { PlayerController } from 'StarterPlayer/StarterPlayerScripts/controllers/PlayerController'

@Component({ tag: BlockBreakerTag })
export class BlockBreakerComponent
  extends BaseComponent<BlockBreakerAttributes, BlockBreaker>
  implements OnStart
{
  constructor(protected playerController: PlayerController) {
    super()
  }

  onStart() {
    const playerSpace = this.playerController.getPlayerSpace()
    const buildingModel = playerSpace.PlacedBlocks
    const ignoreModelForMouse = playerSpace.PlaceBlockPreview
    const previewBlock = ReplicatedStorage.Common.PlaceBlockPreview
    const previewBlockParent = previewBlock.Parent
    const selectionBox = previewBlock.SelectionBox

    const tool = this.instance
    const red = Color3.fromRGB(255, 0, 0)
    const character = Players.LocalPlayer.Character as PlayerCharacter
    const humanoid = character.Humanoid

    let connection: RBXScriptConnection | undefined
    let targetToDestory: BasePart | undefined
    let canUse = true

    const mouse = Players.LocalPlayer.GetMouse()
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
          previewBlock.Parent = previewBlockParent
          targetToDestory = undefined
        }
      })
    })

    tool.Unequipped.Connect(() => {
      connection?.Disconnect()
      previewBlock.Parent = previewBlockParent
    })

    tool.Activated.Connect(() => {
      if (!canUse || !targetToDestory) return
      canUse = false
      this.instance.BreakBlock.InvokeServer(targetToDestory)
      previewBlock.Parent = previewBlockParent
      targetToDestory = undefined
      canUse = true
    })
  }
}
