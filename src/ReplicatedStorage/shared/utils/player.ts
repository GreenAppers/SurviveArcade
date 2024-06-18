import { Players } from '@rbxts/services'
import { CHARACTER_CHILD } from 'ReplicatedStorage/shared/constants/core'
import { findFirstChildWithAttributeValue } from 'ReplicatedStorage/shared/utils/instance'

export const NPCIdAttributeName = 'NPCId'

export function isTeamMate(player1: Player, player2: Player) {
  return (
    player1 &&
    player2 &&
    !player1.Neutral &&
    !player2.Neutral &&
    player1.TeamColor === player2.TeamColor
  )
}

export const isNPCId = (userID: number) => userID < 0

export function getNPCType(name?: unknown): NPCType | undefined {
  if (!name || !typeIs(name, 'string')) return undefined
  switch (name) {
    case 'Rat':
    case 'Player':
      return name
    default:
      return undefined
  }
}

export const getUserIdFromNPCId = (id: number) => -id

export const getNPCIdFromUserId = (id: number) => -id

export const getNameFromUserId = (id: number, workspace: Workspace) =>
  isNPCId(id)
    ? getCharacterFromUserId(id, workspace)?.Name ?? ''
    : Players.GetPlayerByUserId(id)?.Name ?? ''

export function getUserIdFromNPC(instance?: Instance): number | undefined {
  const value = instance?.GetAttribute(NPCIdAttributeName)
  return value && typeIs(value, 'number')
    ? getUserIdFromNPCId(value)
    : undefined
}

export function getUserIdFromCharacter(character?: Instance) {
  const player = Players.GetPlayerFromCharacter(character)
  return player ? player.UserId : getUserIdFromNPC(character)
}

export function getCharacterFromUserId(
  userId: number,
  workspace: Workspace,
): Model | undefined {
  return isNPCId(userId)
    ? findFirstChildWithAttributeValue<Model>(
        workspace.NPC,
        NPCIdAttributeName,
        getNPCIdFromUserId(userId),
      )
    : Players.GetPlayerByUserId(userId)?.Character
}

export function getCharacterHumanoid(character?: Instance) {
  return character?.FindFirstChild<Humanoid>(CHARACTER_CHILD.Humanoid)
}
