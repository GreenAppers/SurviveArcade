import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { Players, ReplicatedStorage } from '@rbxts/services'
import { ToolGiverTag } from 'ReplicatedStorage/shared/constants/tags'
import {
  findDescendentsWhichAre,
  weldParts,
} from 'ReplicatedStorage/shared/utils/instance'
import { getCharacterHumanoid } from 'ReplicatedStorage/shared/utils/player'

export function getBackpackToolName(toolName: ToolName) {
  switch (toolName) {
    case 'Blocks':
      return 'PlaceBlock'
    default:
      return toolName
  }
}

export function giveTool(toolName: ToolName, backpack: Instance) {
  switch (toolName) {
    case 'Blocks':
      setupTool(ReplicatedStorage.Tools.PlaceBlock.Clone()).Parent = backpack
      setupTool(ReplicatedStorage.Tools.BreakBlock.Clone()).Parent = backpack
      break
    default:
      setupTool(ReplicatedStorage.Tools[toolName].Clone()).Parent = backpack
  }
}

export function setupTool(tool: Tool) {
  const handle = tool.FindFirstChild<BasePart>('Handle')
  if (!handle) return tool
  weldParts(findDescendentsWhichAre<BasePart>(handle, 'BasePart'), handle)
  return tool
}

@Component({ tag: ToolGiverTag })
export class ToolGiverComponent
  extends BaseComponent<{ Tool: ToolName }, BasePart>
  implements OnStart
{
  onStart() {
    this.instance.Touched?.Connect((hit) => {
      const humanoid = getCharacterHumanoid(hit.Parent)
      if (!humanoid) return

      const player = Players.GetPlayerFromCharacter(hit.Parent)
      const backpack = player?.FindFirstChild<Backpack>('Backpack')
      const tool = backpack?.FindFirstChild<Tool>(
        getBackpackToolName(this.attributes.Tool),
      )
      if (!player || !backpack || tool) return

      giveTool(this.attributes.Tool, backpack)
    })
  }
}
