import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { Players, ReplicatedStorage } from '@rbxts/services'
import { ToolGiverTag } from 'ReplicatedStorage/shared/constants/tags'
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
      ReplicatedStorage.Tools.PlaceBlock.Clone().Parent = backpack
      ReplicatedStorage.Tools.BreakBlock.Clone().Parent = backpack
      break
    default:
      ReplicatedStorage.Tools[toolName].Clone().Parent = backpack
  }
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
