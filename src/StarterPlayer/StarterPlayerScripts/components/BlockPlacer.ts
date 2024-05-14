import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import {
  Players,
  ReplicatedStorage,
  RunService,
  Workspace,
} from '@rbxts/services'
import { BlockPlacerTag } from 'ReplicatedStorage/shared/constants/tags'
import { PlayerController } from 'StarterPlayer/StarterPlayerScripts/controllers/PlayerController'

function calculateOffset(positionNumber: number) {
  if ((positionNumber * 10) % 3 === 1) return -1
  else if ((positionNumber * 10) % 3 === 2) return 1
  else return 0
}

@Component({ tag: BlockPlacerTag })
export class BlockPlacerComponent
  extends BaseComponent<BlockPlacerAttributes, BlockPlacer>
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
    const baseplate = Workspace.Map.Baseplate
    const selectionBox = previewBlock.SelectionBox

    const bottom = Enum.NormalId.Bottom
    const top = Enum.NormalId.Top
    const front = Enum.NormalId.Front
    const left = Enum.NormalId.Left
    const right = Enum.NormalId.Right
    const green = Color3.fromRGB(0, 255, 0)

    const leftOffset = new CFrame(-3, 0, 0)
    const rightOffset = new CFrame(3, 0, 0)
    const frontOffset = new CFrame(0, 0, -3)
    const backOffset = new CFrame(0, 0, 3)
    const bottomOffset = new CFrame(0, -3, 0)
    const topOffet = new CFrame(0, 3, 0)

    const y = (baseplate.Size.Y + 3) / 2 + baseplate.Position.Y
    const character = Players.LocalPlayer.Character as PlayerCharacter
    const humanoid = character.Humanoid

    let canUse = true
    let connection: RBXScriptConnection | undefined

    const mouse = Players.LocalPlayer.GetMouse()
    mouse.TargetFilter = ignoreModelForMouse

    this.instance.Equipped.Connect(() => {
      selectionBox.Color3 = green
      connection = RunService.RenderStepped.Connect((_deltaTime) => {
        const mouseHit = mouse.Hit
        if (
          character.PrimaryPart &&
          mouseHit.Position.sub(character.PrimaryPart.Position).Magnitude <=
            this.attributes.MaxDistance &&
          humanoid.Health > 0
        ) {
          const mouseTarget = mouse.Target
          if (mouseTarget === baseplate) {
            const x = math.floor(mouseHit.X) + 0.5
            const z = math.floor(mouseHit.Z) + 0.5
            previewBlock.CFrame = new CFrame(
              x + calculateOffset(x),
              y,
              z + calculateOffset(z),
            )
            previewBlock.Parent = ignoreModelForMouse
          } else if (mouseTarget?.Parent === buildingModel) {
            const mouseSurface = mouse.TargetSurface
            if (mouseSurface === left)
              previewBlock.CFrame = mouseTarget.CFrame.ToWorldSpace(leftOffset)
            else if (mouseSurface === right)
              previewBlock.CFrame = mouseTarget.CFrame.ToWorldSpace(rightOffset)
            else if (mouseSurface === bottom)
              previewBlock.CFrame =
                mouseTarget.CFrame.ToWorldSpace(bottomOffset)
            else if (mouseSurface === top)
              previewBlock.CFrame = mouseTarget.CFrame.ToWorldSpace(topOffet)
            else if (mouseSurface === front)
              previewBlock.CFrame = mouseTarget.CFrame.ToWorldSpace(frontOffset)
            // Back
            else
              previewBlock.CFrame = mouseTarget.CFrame.ToWorldSpace(backOffset)

            previewBlock.Parent = ignoreModelForMouse
          } else {
            previewBlock.Parent = previewBlockParent
          }
        } else {
          previewBlock.Parent = previewBlockParent
        }
      })
    })

    this.instance.Unequipped.Connect(() => {
      connection?.Disconnect()
      connection = undefined
      previewBlock.Parent = previewBlockParent
    })

    this.instance.Activated.Connect(() => {
      if (canUse && previewBlock.Parent === ignoreModelForMouse) {
        canUse = false
        this.instance.PlaceBlock.InvokeServer(previewBlock.CFrame)
        canUse = true
      }
    })
  }
}
