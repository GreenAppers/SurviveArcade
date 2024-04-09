import { OnStart, Service } from '@flamework/core'
import { Logger } from '@rbxts/log'
import Object from '@rbxts/object-utils'
import { Lighting, ReplicatedStorage, Workspace } from '@rbxts/services'
import {
  IS_HUMAN_PLACE,
  IS_START_PLACE,
  TYCOON_TYPES,
} from 'ReplicatedStorage/shared/constants/core'
import { selectArcadeTablesState } from 'ReplicatedStorage/shared/state'
import {
  ArcadeTablesState,
  ArcadeTableState,
  ArcadeTableStatus,
  baseArcadeTableName,
  isArcadeTableNextName,
  nextArcadeTableName,
} from 'ReplicatedStorage/shared/state/ArcadeTablesState'
import { animateBuildingIn } from 'ServerScriptService/buildin'
import { Events } from 'ServerScriptService/network'
import { store } from 'ServerScriptService/store'
import { getDescendentsWhichAre } from 'ServerScriptService/utils'

export interface MapAPI {
  scale: TycoonType
}

export function getArcadeTableCFrame(name: ArcadeTableName) {
  return game.Workspace.Map?.[name]?.Baseplate?.CFrame || new CFrame()
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
            this.loadArcadeTable(map, tableName, state)
        }
      }
    }
  }

  loadArcadeTable(
    mapAPI: MapAPI,
    tableName: ArcadeTableName,
    state: ArcadeTableState,
  ) {
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
  ) {
    const parts = getDescendentsWhichAre(arcadeTable, 'BasePart') as BasePart[]
    for (const part of parts) {
      if (part.Name === 'BallTemplate') continue
      if (part.Name === 'Baseplate') {
        arcadeTable.PrimaryPart = part
      } else if (part.Name === 'Stator') {
        part.BrickColor = state.statorColor
      } else if (string.match(part.Name, '^Floor*')[0]) {
        part.BrickColor = state.baseColor
        part.Material = state.baseMaterial
      } else {
        part.BrickColor = state.color
      }
    }
    arcadeTable.Baseplate.BrickColor = state.baseColor
    arcadeTable.Baseplate.Material = state.baseMaterial
    if (cframe) arcadeTable.PivotTo(cframe)
    arcadeTable.Parent = Workspace.ArcadeTables
  }

  setupNextArcadeTable(arcadeTable: ArcadeTable, cframe: CFrame) {
    const parts = <BasePart[]>getDescendentsWhichAre(arcadeTable, 'BasePart')
    for (const part of parts) {
      if (part.Name === 'Baseplate') arcadeTable.PrimaryPart = part
      if (part.Transparency === 1) continue
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
    const nextTableState = arcadeTablesState[nextArcadeTableName(name)]
    let arcadeTable = <ArcadeTable>(
      game.Workspace.ArcadeTables?.FindFirstChild(name)
    )
    const nextArcadeTable = <ArcadeTable>(
      game.Workspace.ArcadeTables?.FindFirstChild(nextArcadeTableName(name))
    )
    arcadeTable?.Destroy()
    nextArcadeTable?.Destroy()
    store.resetArcadeTable(name)
    const oldState = arcadeTableState || nextTableState
    const tableMap = arcadeTableState?.tableMap || nextTableState?.tableMap
    if (!tableMap || !oldState) return
    arcadeTable = this.loadArcadeTableTemplate(tableMap, name)
    arcadeTable.Name = name
    this.setupArcadeTable(arcadeTable, oldState, getArcadeTableCFrame(name))
  }

  materializeTable(
    name: ArcadeTableName | ArcadeTableNextName,
    player: Player,
  ) {
    const state = store.getState().arcadeTables[name]
    const unmaterializedArcadeTable = game.Workspace.ArcadeTables?.[name]
    const arcadeTableCF = unmaterializedArcadeTable?.PrimaryPart?.CFrame
    if (
      state?.status === ArcadeTableStatus.Unmaterialized &&
      state.tableMap &&
      unmaterializedArcadeTable &&
      arcadeTableCF
    ) {
      const baseName = baseArcadeTableName(name)
      store.updateArcadeTableStatus(name, ArcadeTableStatus.Active)
      const arcadeTable = this.loadArcadeTableTemplate(state.tableMap, baseName)
      arcadeTable.Name = name
      this.setupArcadeTable(arcadeTable, state, arcadeTableCF)
      const isNextName = isArcadeTableNextName(name)
      if (isNextName) game.Workspace.ArcadeTables?.[baseName]?.Destroy()
      if (unmaterializedArcadeTable) unmaterializedArcadeTable.Destroy()
      Events.arcadeTableMaterialize.fire(player, name)
      if (arcadeTable.Backbox)
        animateBuildingIn(
          arcadeTable.Backbox,
          new TweenInfo(1, Enum.EasingStyle.Linear, Enum.EasingDirection.Out),
        )?.Wait()
      if ((state?.sequence || 0) % 8 === 0)
        store.addLoops(player.UserId, state.tableType, 1)
    }
  }

  chainNextTable(name: ArcadeTableName | ArcadeTableNextName) {
    const isNextName = isArcadeTableNextName(name)
    const arcadeTableBaseName = baseArcadeTableName(name)
    const arcadeTableNextName = nextArcadeTableName(name)
    const arcadeTablesState = store.getState().arcadeTables
    const state = arcadeTablesState[arcadeTableBaseName]
    let arcadeTable = <ArcadeTable | undefined>(
      game.Workspace.ArcadeTables?.FindFirstChild(arcadeTableBaseName)
    )
    let arcadeTableNext = <ArcadeTable | undefined>(
      game.Workspace.ArcadeTables?.FindFirstChild(arcadeTableNextName)
    )
    if (!state?.tableMap) return
    store.extendArcadeTable(name)

    if (isNextName && arcadeTableNext) {
      arcadeTable?.Destroy()
      arcadeTable = arcadeTableNext
      arcadeTable.Name = arcadeTableBaseName
      arcadeTableNext = undefined
    }
    const nextArcadeTableCF = arcadeTable?.NextBaseplate?.CFrame
    if (arcadeTableNext || !nextArcadeTableCF) return
    arcadeTableNext = this.loadArcadeTableTemplate(
      state.tableMap,
      arcadeTableBaseName,
    )
    arcadeTableNext.Name = arcadeTableNextName
    this.setupNextArcadeTable(arcadeTableNext, nextArcadeTableCF)
  }
}
