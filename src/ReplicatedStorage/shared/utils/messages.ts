import Object from '@rbxts/object-utils'
import messages from 'ReplicatedStorage/shared/constants/messages.json'

export const MESSAGE = {
  GameWelcome: 'GameWelcome',
  GameRespawn: 'GameRespawn',
  GuideWelcome: 'GuideWelcome',
  GuideClaimTycoon: 'GuideClaimTycoon',
  GuideBuildTycoon: 'GuideBuildTycoon',
  GuideCollectCoins: 'GuideCollectCoins',
  GuideWinTickets: 'GuideWinTickets',
  ArcadeTableStart: 'ArcadeTableStart',
  ArcadeTableWon: 'ArcadeTableWon',
  ArcadeTableLooped: 'ArcadeTableLooped',
  TicketsWon: 'TicketsWon',
  DollarsNeeded: 'DollarsNeeded',
  TycoonNeeded: 'TycoonNeeded',
  CoinProximityPrompt: 'CoinProximityPrompt',
  CommunicatorProximityPrompt: 'CommunicatorProximityPrompt',
  TeleportHuman: 'TeleportHuman',
  TeleportElf: 'TeleportElf',
  QuestCommunicate: 'QuestCommunicate',
}

export const messageConstants = messages as Record<
  string,
  { Message: string }[]
>

export function formatMessage(
  name: string,
  args?: Record<string, string | number>,
) {
  const templates = messageConstants[name] ?? [{ Message: '' }]
  let message = templates[math.random(templates.size()) - 1].Message
  for (const [key, value] of Object.entries(args ?? {})) {
    ;[message] = message.gsub(`{${key}}`, `${value}`)
  }
  return message
}