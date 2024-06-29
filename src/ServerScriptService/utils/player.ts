import { Dependency } from '@flamework/core'
import { Debris, Players } from '@rbxts/services'
import {
  getNPCType,
  getUserIdFromNPC,
} from 'ReplicatedStorage/shared/utils/player'
import { NPCService } from 'ServerScriptService/services/NPCService'

export type PlayerReceivingFunction = (player: Player) => unknown

export const attackerInstanceName = 'attacker'

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
    const userId = getUserIdFromNPC(npc)
    if (!userId) continue
    result.push({
      UserId: userId,
      Name: npc.Name,
      Character: npc,
    })
  }
  return result
}

export function tagHumanoid(humanoid: Humanoid, userId: number) {
  const attacker = new Instance('IntValue')
  attacker.Name = attackerInstanceName
  attacker.Value = userId
  Debris.AddItem(attacker, 2)
  attacker.Parent = humanoid
}

export function untagHumanoid(humanoid: Humanoid) {
  for (const v of humanoid.GetChildren()) {
    if (v.IsA('IntValue') && v.Name === attackerInstanceName) v.Destroy()
  }
}

export function getAttackerUserId(humanoid: Humanoid): number {
  const attacker = humanoid.FindFirstChild(attackerInstanceName)
  return attacker?.IsA('IntValue') ? attacker.Value : 0
}

export function takeDamage(
  humanoid: Humanoid,
  damage: number,
  attackerUserId?: number,
  _type?: string,
) {
  if (attackerUserId) {
    untagHumanoid(humanoid)
    tagHumanoid(humanoid, attackerUserId)
  }
  humanoid.TakeDamage(damage)
}
