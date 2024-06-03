import { CollectionService } from '@rbxts/services'
import { ArcadeTableTag } from 'ReplicatedStorage/shared/constants/tags'

export function isArcadeTable(arcadeTable: Instance) {
  return CollectionService.HasTag(arcadeTable, ArcadeTableTag)
}

export function getArcadeTableFromDescendent(instance: Instance) {
  while (instance) {
    if (CollectionService.HasTag(instance, ArcadeTableTag))
      return instance as ArcadeTable
    if (!instance.Parent) break
    instance = instance.Parent
  }
  return undefined
}

export function flipPinballFlipper(
  arcadeTable?: ArcadeTable,
  flipperName?: string,
  force?: number,
) {
  if (!arcadeTable || !flipperName) return
  const flipperModel = arcadeTable.FindFirstChild(flipperName)
  const flipper = flipperModel?.FindFirstChild('Flipper')
  const rotor = flipper?.FindFirstChild<BasePart>('Rotor')
  if (!rotor) return
  const orientation = flipperName === 'FlipperRight' ? -1 : 1
  rotor.ApplyAngularImpulse(
    rotor.CFrame.RightVector.mul(orientation * 600000 * (force ?? 1)),
  )
}
