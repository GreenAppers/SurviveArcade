import Object from '@rbxts/object-utils'
import { CollectionService } from '@rbxts/services'
import { ARCADE_TABLE_TYPES } from 'ReplicatedStorage/shared/constants/core'
import { digitalFont } from 'ReplicatedStorage/shared/constants/digitalfont'
import {
  ArcadeCabinetTag,
  ArcadeTableTag,
} from 'ReplicatedStorage/shared/constants/tags'
import { randomElement } from 'ReplicatedStorage/shared/utils/object'
import { renderGlyphs } from 'ReplicatedStorage/shared/utils/sprite'

export function firstArcadeTableMap(
  arcadeTableType: ArcadeTableType,
): ArcadeTableMap {
  switch (arcadeTableType) {
    case 'AirHockey':
      return 'AirHockey1'
    case 'Foosball':
      return 'Foosball1'
    case 'Pinball':
      return 'Pinball1'
  }
}

export function randomArcadeTableType(
  _arcadeTableType?: ArcadeTableType,
): ArcadeTableType {
  const types = Object.values(ARCADE_TABLE_TYPES)
  return randomElement(types)
}

export function nextArcadeTableType(
  arcadeTableType: ArcadeTableType,
): ArcadeTableType {
  const types = Object.values(ARCADE_TABLE_TYPES)
  const index = types.indexOf(arcadeTableType)
  return types[(index + 1) % types.size()]
}

export function isArcadeTable(arcadeTable: Instance) {
  return CollectionService.HasTag(arcadeTable, ArcadeTableTag)
}

export function getArcadeCabinetFromDescendent(instance: Instance) {
  while (instance) {
    if (CollectionService.HasTag(instance, ArcadeCabinetTag))
      return instance as Instance & { Name: ArcadeTableName }
    if (!instance.Parent) break
    instance = instance.Parent
  }
  return undefined
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

export function getArcadeTableSpawn(arcadeTable?: ArcadeTable) {
  return arcadeTable?.Control?.Seat?.CFrame?.ToWorldSpace(
    new CFrame(new Vector3(0, 5, 3)),
  )
}
export function updateScoreboard(
  tableName: string,
  text: string,
  maxLength = 14,
) {
  // Find the scoreboard on the arcade table.
  const arcadeTable =
    game.Workspace.ArcadeTables.FindFirstChild<ArcadeTable>(tableName)
  if (!arcadeTable?.FindFirstChild('Backbox')) return
  const surfaceGuiFrame = arcadeTable.Backbox?.Scoreboard.SurfaceGui.Frame
  if (!surfaceGuiFrame) return

  // Render the text on the scoreboard.
  renderGlyphs(text, digitalFont, surfaceGuiFrame, {
    existingGlyphsLength: maxLength,
    textScaled: true,
  })
}
