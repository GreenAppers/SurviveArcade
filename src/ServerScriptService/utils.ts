import { Players } from '@rbxts/services'
import { store } from 'ServerScriptService/store'

type PlayerReceivingFunction = (player: Player) => unknown

export function getDescendentsWhichAre(
  ancestor: Instance,
  className: keyof Instances,
) {
  assert(typeOf(ancestor) === 'Instance', 'Expected Instance ancestor')
  assert(typeOf(className) === 'string', 'Expected string className')
  const descendents = []
  for (const descendent of ancestor.GetDescendants()) {
    if (descendent.IsA(className)) descendents.push(descendent)
  }
  return descendents
}

export function forEveryPlayer(
  joinFunc: PlayerReceivingFunction,
  leaveFunc?: PlayerReceivingFunction,
): Array<RBXScriptConnection> {
  const events: Array<RBXScriptConnection> = []

  Players.GetPlayers().forEach(joinFunc)
  events.push(Players.PlayerAdded.Connect(joinFunc))
  if (leaveFunc) events.push(Players.PlayerRemoving.Connect(leaveFunc))

  return events
}

export function isArcadeTable(arcadeTable: Instance) {
  if (string.match(arcadeTable.Name, '^Table[0-9]+$')[0]) {
    return true
  }
  return false
}

export function getParentArcadeTable(instance: Instance) {
  while (instance.Parent) {
    if (instance.Parent.Name === 'ArcadeTables') return instance
    instance = instance.Parent
  }
  return instance
}

export function getArcadeTableOwner(instance: Instance) {
  const arcadeTable = getParentArcadeTable(instance)
  if (!arcadeTable) return undefined
  return store.getState().arcadeTables[arcadeTable?.Name ?? '']?.owner
}

export function addScore(player: Player, incrementValue: number) {
  return store
    .getActions()
    .addScore(store.getState(), player.UserId, incrementValue)
}

export function playSound(object: Instance, soundId: string) {
  let sound = object.FindFirstChild('Sound') as Sound
  if (sound) {
    sound.Play()
  } else {
    sound = new Instance('Sound')
    sound.SoundId = soundId
    sound.Parent = object
    sound.Play()
  }
}
