export function forEveryPlayerCharacterAdded(
  player: Player,
  addedFunc: (character: PlayerCharacter) => void,
): RBXScriptConnection {
  const connection = player.CharacterAdded.Connect((character) =>
    addedFunc(character as PlayerCharacter),
  )
  if (player.Character) addedFunc(player.Character as PlayerCharacter)
  return connection
}

/**
 * Reformat a number to a string with a thousands separator.
 */
export function formatInteger(value: unknown) {
  return tostring(value)
    .reverse()
    .gsub('%d%d%d', '%1,')[0]
    .reverse()
    .gsub('^,', '')[0]
}

export function formatDuration(value: number) {
  const minutes = math.floor(value / 60)
  const seconds = math.floor(value % 60)
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}
