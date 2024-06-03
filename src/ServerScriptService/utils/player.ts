import { Dependency } from '@flamework/core'
import { Players } from '@rbxts/services'
import {
  getNPCType,
  getUserIdFromNPCName,
} from 'ReplicatedStorage/shared/utils/player'
import { NPCService } from 'ServerScriptService/services/NPCService'

type PlayerReceivingFunction = (player: Player) => unknown

export function forEveryPlayer(
  joinFunc: PlayerReceivingFunction,
  leaveFunc?: PlayerReceivingFunction,
): Array<RBXScriptConnection> {
  const events: Array<RBXScriptConnection> = []
  const spawnJoinFunc = (player: Player) => task.spawn(() => joinFunc(player))

  Players.GetPlayers().forEach(spawnJoinFunc)
  events.push(Players.PlayerAdded.Connect(joinFunc))
  if (leaveFunc) events.push(Players.PlayerRemoving.Connect(leaveFunc))

  return events
}

export function getPlayers() {
  const result = Players.GetPlayers().map((x) => ({
    UserId: x.UserId,
    Name: x.Name,
    Character: x.Character,
  }))
  const npcService = Dependency<NPCService>()
  for (const npc of game.Workspace.NPC.GetChildren<Model>()) {
    const npcType = getNPCType(npc.GetAttribute('NPCType'))
    if (!npcType || !npcService.population[npcType]?.createPlayer) continue
    result.push({
      UserId: getUserIdFromNPCName(npc.Name),
      Name: npc.Name,
      Character: npc,
    })
  }
  return result
}
