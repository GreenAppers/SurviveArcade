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
