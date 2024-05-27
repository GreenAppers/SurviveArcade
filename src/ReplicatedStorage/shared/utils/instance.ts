import { CollectionService } from '@rbxts/services'

export function findFirstChildWhichIs<X = Instance>(
  ancestor: Instance,
  childName: string,
  className: keyof Instances,
) {
  for (const child of ancestor.GetChildren()) {
    if (child.Name === childName && child.IsA(className)) return child as X
  }
  return undefined
}

export function findDescendentsWhichAre(
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

export function findDescendentsWithTag(ancestor: Instance, tagName: string) {
  assert(typeOf(ancestor) === 'Instance', 'Expected Instance ancestor')
  const descendents = []
  for (const descendent of ancestor.GetDescendants()) {
    if (CollectionService.HasTag(descendent, tagName))
      descendents.push(descendent)
  }
  return descendents
}

export function setHidden(ancestor: Instance, hidden: boolean) {
  for (const descendent of ancestor.GetDescendants()) {
    if (descendent.IsA('BasePart')) {
      descendent.CanCollide = !hidden
      descendent.CanTouch = !hidden
      descendent.Transparency = hidden ? 1 : 0
    } else if (
      descendent.IsA('BillboardGui') ||
      descendent.IsA('ParticleEmitter') ||
      descendent.IsA('ProximityPrompt')
    ) {
      descendent.Enabled = !hidden
    }
  }
  if (ancestor.IsA('BasePart')) {
    ancestor.CanCollide = !hidden
    ancestor.CanTouch = !hidden
    ancestor.Transparency = hidden ? 1 : 0
  }
}

export function setNetworkOwner(ancestor: Instance, player?: Player) {
  for (const descendent of ancestor.GetDescendants()) {
    if (descendent.IsA('BasePart') && descendent.CanSetNetworkOwnership()[0]) {
      descendent.SetNetworkOwner(player)
    }
  }
  if (ancestor.IsA('BasePart') && ancestor.CanSetNetworkOwnership()[0]) {
    ancestor.SetNetworkOwner(player)
  }
}
