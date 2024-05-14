import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { ReplicatedStorage, Workspace } from '@rbxts/services'
import { BlockPlacerTag } from 'ReplicatedStorage/shared/constants/tags'
import { PlayerService } from 'ServerScriptService/services/PlayerService'

// Workspace Models holders: BuildingModel IgnoreModelForMouse

/*function calculateOffset(positionNumber: number) {
  if ((positionNumber * 10) % 3 === 1) return -1
  else if ((positionNumber * 10) % 3 === 2) return 1
  else return 0
}*/

@Component({ tag: BlockPlacerTag })
export class BlockPlacerComponent
  extends BaseComponent<BlockPlacerAttributes, BlockPlacer>
  implements OnStart
{
  constructor(private playerService: PlayerService) {
    super()
  }

  // No floating blocks
  /*--Made by: Spiderr12PL
local tableInsert, tableRemove, tableFind = table.insert, table.remove, table.find
local worksSpace = workspace
local pairsF = pairs

local overlapParams = OverlapParams.new()
local blockSize = Vector3.new(3, 3, 3)

local baseplate = worksSpace.Baseplate
local blocks = {baseplate}

local function touchingBaseplateCheck(toCheckBlocks, lastIndex)
	local newBlocks = {}
	for i, toCheckBlock in pairsF(toCheckBlocks) do
		for i, touchingBlock in pairsF(worksSpace:GetPartBoundsInBox(toCheckBlock.CFrame, blockSize, overlapParams)) do
			if touchingBlock:GetAttribute("CanFloat") then
				return false
			end
			if tableFind(newBlocks, touchingBlock) == nil then
				tableInsert(newBlocks, touchingBlock)
			end
		end
	end
	if #newBlocks == lastIndex then
		return true
	end
	return touchingBaseplateCheck(newBlocks, #newBlocks)
end

overlapParams.FilterType = Enum.RaycastFilterType.Include

worksSpace.BuildingModel.ChildAdded:Connect(function(child)
	for i, block in pairsF(blocks) do
		if block.CFrame == child.CFrame then
			block:Destroy()
		end
	end
	tableInsert(blocks, child)
end)

worksSpace.BuildingModel.ChildRemoved:Connect(function(child)
	tableRemove(blocks, tableFind(blocks, child))
	overlapParams.FilterDescendantsInstances = blocks
	for i, block in pairsF(blocks) do
		if not block:GetAttribute("CanFloat") and block ~= baseplate and touchingBaseplateCheck({block}, 0) then
			block:Destroy()
		end
	end
end)*/

  onStart() {
    const placeSound = Workspace.Audio.BlockPlaced
    const block = ReplicatedStorage.Common.PlaceBlockBlock
    // const baseplate = Workspace.Map.Baseplate
    /*const minY = (baseplate.Size.Y + 3) / 2 + baseplate.Position.Y
    const baseplateSizeX = baseplate.Size.X
    const baseplateSizeZ = baseplate.Size.Z*/

    this.instance.PlaceBlock.OnServerInvoke = (
      player: Player,
      previewCframe: unknown,
    ) => {
      if (!typeIs(previewCframe, 'CFrame')) return

      xpcall(
        () => {
          /*let x = math.floor(previewCframe.X) + 0.5
          let z = math.floor(previewCframe.Z) + 0.5
          x = x + calculateOffset(x)
          z = z + calculateOffset(z)
          let yAbove = previewCframe.Y - minY
          [[if x ~= previewCframe.X or z ~= previewCframe.Z or (minY ~= previewCframe.Y and yAbove % 3 ~= 0)
			or (previewCframe.Position - player.Character.PrimaryPart.Position).Magnitude > tool:GetAttribute("MaxDistance") + 6
			or previewCframe.Y  < minY or mathAbs(previewCframe.X) > baseplateSizeX / 2
			or mathAbs(previewCframe.Z) > baseplateSizeZ / 2
		then
			player:Kick("Stop exploiting! AAA")
			return false
		end]]*/
          const clonedBlock = block.Clone()
          const clonedSound = placeSound.Clone()
          clonedBlock.Name = 'Block'
          clonedBlock.SetAttribute('CanFloat', this.attributes.CanFloat)
          if (this.attributes.IsColorRandom)
            clonedBlock.BrickColor = BrickColor.random()
          else clonedBlock.Color = this.attributes.Color
          const material = Enum.Material.GetEnumItems().find(
            (x) => x.Name === this.attributes.Material,
          )
          if (material) clonedBlock.Material = material
          clonedBlock.CFrame = previewCframe
          clonedSound.Parent = clonedBlock
          clonedBlock.Parent =
            this.playerService.getPlayerSpace(player).PlacedBlocks
          clonedSound.Play()
        },
        () => {
          player.Kick('Stop exploiting ZZZ!')
        },
      )
    }
  }
}
