import { Players } from '@rbxts/services'
import { CHARACTER_CHILD } from 'ReplicatedStorage/shared/constants/core'

export const isNPCId = (userID: number) => userID < 0

export const getUserIdFromNPCId = (id: number) => -id

export const getNPCIdFromUserId = (id: number) => -id

export const getNameFromUserId = (id: number) =>
  isNPCId(id)
    ? `NPC_${getNPCIdFromUserId(id)}`
    : Players.GetPlayerByUserId(id)?.Name ?? ''

export function getUserIdFromNPCName(name: string) {
  const match = name.match('^NPC_%d+')
  if (match.size() < 2) return 0
  const npcId = tonumber(match[1])
  return npcId ? getUserIdFromNPCId(npcId) : 0
}

export function getUserIdFromCharacter(character?: Instance) {
  const player = Players.GetPlayerFromCharacter(character)
  return player ? player.UserId : getUserIdFromNPCName(character?.Name || '')
}

export function getCharacterFromUserId(
  userId: number,
  workspace: Workspace,
): Model | undefined {
  return isNPCId(userId)
    ? workspace.NPC.FindFirstChild<Model>(getNameFromUserId(userId))
    : Players.GetPlayerByUserId(userId)?.Character
}

export function getCharacterHumanoid(character?: Instance) {
  return character?.FindFirstChild<Humanoid>(CHARACTER_CHILD.Humanoid)
}
