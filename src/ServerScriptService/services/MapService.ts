import { OnStart, Service } from '@flamework/core'
import { Logger } from '@rbxts/log'
import Object from '@rbxts/object-utils'
import {
  Lighting,
  Players,
  ReplicatedStorage,
  Workspace,
} from '@rbxts/services'
import {
  IS_HUMAN_PLACE,
  IS_START_PLACE,
  TYCOON_TYPES,
} from 'ReplicatedStorage/shared/constants/core'
import {
  selectArcadeTablesState,
  selectArcadeTableState,
} from 'ReplicatedStorage/shared/state'
import {
  ArcadeTablesState,
  ArcadeTableState,
  ArcadeTableStatus,
  baseArcadeTableName,
  nextArcadeTableName,
} from 'ReplicatedStorage/shared/state/ArcadeTablesState'
import { mechanics } from 'ReplicatedStorage/shared/tables/mechanics'
import { firstArcadeTableMap } from 'ReplicatedStorage/shared/utils/arcade'
import { findDescendentsWhichAre } from 'ReplicatedStorage/shared/utils/instance'
import { endsWith } from 'ReplicatedStorage/shared/utils/object'
import { Events } from 'ServerScriptService/network'
import { store } from 'ServerScriptService/store'
import { animateBuildingIn } from 'ServerScriptService/utils/buildin'

export interface MapAPI {
  scale: TycoonType
}

export const materialAttributeName = 'Material'

export const materialNameMap: Record<string, Enum.Material> =
  Object.fromEntries(Enum.Material.GetEnumItems().map((x) => [x.Name, x]))

export function getArcadeTableCFrame(name: ArcadeTableName) {
  return game.Workspace.Map?.[name]?.Ground?.CFrame || new CFrame()
}

export function getTycoonCFrame(name: TycoonName) {
  return game.Workspace.Map?.[name]?.Baseplate?.CFrame || new CFrame()
}

@Service()
export class MapService implements OnStart {
  maps: Record<string, MapAPI> = {
    ElfMap: {
      scale: TYCOON_TYPES.Elf,
    },
    HumanMap: {
      scale: TYCOON_TYPES.Human,
    },
  }
  currentMap = ''

  constructor(private readonly logger: Logger) {}

  getRandomSpawnLocation(height = 5) {
    const radius = 170
    const randomAngle = math.random() * math.pi * 2
    const baseplate =
      Workspace.FindFirstChild('Map')?.FindFirstChild<BasePart>('Baseplate')
        ?.CFrame ?? new CFrame(0, -10, 0)
    return baseplate.ToWorldSpace(
      new CFrame(
        math.cos(randomAngle) * radius,
        height,
        math.sin(randomAngle) * radius,
      ),
    )
  }

  getMap() {
    return this.maps[this.currentMap]
  }

  clearMap() {
    Workspace.ArcadeTables.ClearAllChildren()
    Workspace.Map?.Destroy()
  }

  loadMap(mapName: string) {
    this.logger.Info(`Loading map ${mapName}`)
    this.loadMapWithState(mapName, store.getState().arcadeTables)
  }

  loadMapWithState(mapName: string, arcadeTablesState: ArcadeTablesState) {
    this.clearMap()
    const map = this.maps[mapName]
    if (!map) return

    const mapModelTemplate = ReplicatedStorage.Maps[mapName]
    if (!mapModelTemplate) return

    this.currentMap = mapName
    const mapModel = mapModelTemplate.Clone()
    mapModel.Name = 'Map'
    mapModel.Parent = Workspace

    const existingSkybox = Lighting.FindFirstChild('Skybox')
    existingSkybox?.Destroy()
    if (mapModel?.Skybox) mapModel.Skybox.Parent = Lighting

    if (map.scale === TYCOON_TYPES.Elf) {
      for (const [tableName, state] of Object.entries(arcadeTablesState)) {
        switch (tableName) {
          case 'Table1':
          case 'Table2':
          case 'Table3':
          case 'Table4':
            this.loadArcadeTable(tableName, state)
        }
      }
    }
  }

  loadArcadeTable(tableName: ArcadeTableName, state: ArcadeTableState) {
    if (!state.tableMap) return
    const arcadeTable = this.loadArcadeTableTemplate(state.tableMap, tableName)
    this.setupArcadeTable(arcadeTable, state, getArcadeTableCFrame(tableName))
    return arcadeTable
  }

  loadArcadeTableTemplate(name: ArcadeTableMap, tableName: ArcadeTableName) {
    const arcadeTableTemplate = ReplicatedStorage.ArcadeTables[name]
    const arcadeTable = arcadeTableTemplate.Clone()
    arcadeTable.Name = tableName
    return arcadeTable
  }

  setupArcadeTable(
    arcadeTable: ArcadeTable,
    state: ArcadeTableState,
    cframe?: CFrame,
    restoreMaterial?: boolean,
  ) {
    const parts = findDescendentsWhichAre(arcadeTable, 'BasePart') as BasePart[]
    const arcadeTableMechanics = mechanics[state.tableType]
    const groundTable = state.sequence % 8 === 0
    for (const part of parts) {
      arcadeTableMechanics.onCreateTablePart(arcadeTable, state, part)
      if (endsWith(part.Name, 'Template')) continue
      if (
        ((groundTable || !arcadeTable.PrimaryPart) && part.Name === 'Ground') ||
        (!groundTable && part.Name === 'Baseplate')
      ) {
        arcadeTable.PrimaryPart = part
      }
      if (!restoreMaterial) continue
      const attributeValue = part.GetAttribute(materialAttributeName)
      const material = typeIs(attributeValue, 'string')
        ? materialNameMap[attributeValue]
        : undefined
      if (material) part.Material = material
    }
    const baseplate =
      arcadeTable.FindFirstChild<BasePart>('Baseplate') ??
      arcadeTable.FindFirstChild<BasePart>('Ground')
    if (baseplate) {
      baseplate.BrickColor = state.baseColor
      baseplate.Material = state.baseMaterial
    }
    if (cframe) arcadeTable.PivotTo(cframe)
    arcadeTable.Parent = Workspace.ArcadeTables
  }

  setupNextArcadeTable(
    arcadeTable: ArcadeTable,
    state: ArcadeTableState,
    cframe: CFrame,
  ) {
    const parts = findDescendentsWhichAre(arcadeTable, 'BasePart') as BasePart[]
    const groundTable = (state.sequence + 1) % 8 === 0
    for (const part of parts) {
      if (
        ((groundTable || !arcadeTable.PrimaryPart) && part.Name === 'Ground') ||
        (!groundTable && part.Name === 'Baseplate')
      ) {
        arcadeTable.PrimaryPart = part
      }
      if (part.Transparency === 1) continue
      part.SetAttribute(materialAttributeName, part.Material.Name)
      part.Material = Enum.Material.ForceField
    }
    arcadeTable.PivotTo(cframe)
    arcadeTable.Parent = Workspace.ArcadeTables
  }

  onStart() {
    if (IS_START_PLACE) this.loadMap('ElfMap')
    else if (IS_HUMAN_PLACE) this.loadMap('HumanMap')
  }

  resetTable(name: ArcadeTableName) {
    const arcadeTablesState = selectArcadeTablesState()(store.getState())
    const arcadeTableState = arcadeTablesState[name]
    return this.resetTableWithState(name, arcadeTableState)
  }

  resetTableWithState(
    name: ArcadeTableName,
    arcadeTableState: ArcadeTableState,
  ) {
    this.logger.Info(`Resetting table ${name}`)
    let arcadeTable =
      game.Workspace.ArcadeTables?.FindFirstChild<ArcadeTable>(name)
    const nextArcadeTable =
      game.Workspace.ArcadeTables?.FindFirstChild<ArcadeTable>(
        nextArcadeTableName(name),
      )
    arcadeTable?.Destroy()
    store.resetArcadeTable(name)
    const oldState = arcadeTableState
    const tableMap = arcadeTableState?.tableMap
    if (!tableMap || !oldState) return
    arcadeTable =
      nextArcadeTable || this.loadArcadeTableTemplate(tableMap, name)
    arcadeTable.Name = name
    this.setupArcadeTable(
      arcadeTable,
      { ...oldState, sequence: 0 },
      getArcadeTableCFrame(name),
      !!nextArcadeTable,
    )
  }

  createNextTable(name: ArcadeTableName) {
    const arcadeTableNextName = nextArcadeTableName(name)
    const arcadeTablesState = store.getState().arcadeTables
    const state = arcadeTablesState[name]
    const groundTable = (state.sequence + 1) % 8 === 0
    const arcadeTable =
      game.Workspace.ArcadeTables?.FindFirstChild<ArcadeTable>(name)
    let arcadeTableNext =
      game.Workspace.ArcadeTables?.FindFirstChild<ArcadeTable>(
        arcadeTableNextName,
      )
    if (!state?.tableMap || arcadeTableNext) return
    const nextArcadeTableCF = groundTable
      ? getArcadeTableCFrame(name)
      : arcadeTable?.NextBaseplate?.CFrame
    if (!nextArcadeTableCF) return
    const tableMap = firstArcadeTableMap(state.nextTableType)
    arcadeTableNext = this.loadArcadeTableTemplate(tableMap, name)
    arcadeTableNext.Name = arcadeTableNextName as ArcadeTableName
    this.setupNextArcadeTable(arcadeTableNext, state, nextArcadeTableCF)
  }

  activateNextTable(
    name: ArcadeTableName | ArcadeTableNextName,
    userId: number,
  ) {
    const baseName = baseArcadeTableName(name)
    const nextName = nextArcadeTableName(name)
    const arcadeTableSelector = selectArcadeTableState(baseName)

    let arcadeTableState = arcadeTableSelector(store.getState())
    const unmaterializedArcadeTable =
      game.Workspace.ArcadeTables?.FindFirstChild<ArcadeTable>(nextName)
    const arcadeTableCF = unmaterializedArcadeTable?.PrimaryPart?.CFrame
    if (
      arcadeTableState.status === ArcadeTableStatus.Won &&
      arcadeTableState.tableMap &&
      unmaterializedArcadeTable &&
      arcadeTableCF
    ) {
      arcadeTableState = arcadeTableSelector(store.extendArcadeTable(baseName))
      this.logger.Info(
        `Activating next table ${nextName}-${arcadeTableState.sequence}`,
      )

      const previousArcadeTable = game.Workspace.ArcadeTables[baseName]
      const arcadeTable = this.loadArcadeTableTemplate(
        arcadeTableState.tableMap,
        baseName,
      )
      this.setupArcadeTable(arcadeTable, arcadeTableState, arcadeTableCF)

      previousArcadeTable?.Destroy()
      unmaterializedArcadeTable.Destroy()

      const player = Players.GetPlayerByUserId(userId)
      if (player) Events.arcadeTableMaterialize.fire(player, baseName)

      if (arcadeTable.Backbox)
        animateBuildingIn(
          arcadeTable.Backbox,
          new TweenInfo(1, Enum.EasingStyle.Linear, Enum.EasingDirection.Out),
        )?.Wait()

      if (arcadeTableState.sequence > 0 && arcadeTableState.sequence % 8 === 0)
        store.addPlayerLoops(userId, arcadeTableState.tableType, 1)
    }
  }
}
