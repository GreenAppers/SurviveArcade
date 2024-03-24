import { OnStart, Service } from '@flamework/core'
import Object from '@rbxts/object-utils'
import { ReplicatedStorage, Workspace } from '@rbxts/services'
import { TYCOON_TYPES } from 'ReplicatedStorage/shared/constants/core'
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
  getArcadeTableCFrame: (name: ArcadeTableName) => CFrame
  getTycoonCFrame: (name: TycoonName) => CFrame
  getTycoonType: () => TycoonType
}


@Service()
export class MapService implements OnStart {
  maps: Record<string, MapAPI> = {
    Map1: {
      getArcadeTableCFrame: (name) => {
        return game.Workspace.Map?.[name]?.Baseplate?.CFrame || new CFrame()
      },
      getTycoonCFrame: (name) => {
        return game.Workspace.Map?.[name]?.Baseplate?.CFrame || new CFrame()
      },
      getTycoonType: () => {
        return TYCOON_TYPES.Elf
      },
    },
  }
  currentMap = ''

  getMap() {
    return this.maps[this.currentMap]
  }

  clearMap() {
    Workspace.ArcadeTables.ClearAllChildren()
    Workspace.Map?.Destroy()
  }

  loadMap(mapName: string) {
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

  loadArcadeTable(
    mapAPI: MapAPI,
    tableName: ArcadeTableName,
    state: ArcadeTableState,
  ) {
    if (!state.tableMap) return
    const arcadeTable = this.loadArcadeTableTemplate(state.tableMap, tableName)
    this.setupArcadeTable(
      arcadeTable,
      state,
      mapAPI.getArcadeTableCFrame(tableName),
    )
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
    this.loadMap('Map1')
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
    this.setupArcadeTable(
      arcadeTable,
      oldState,
      this.maps[this.currentMap]?.getArcadeTableCFrame(name),
    )
  }

  materializeTable(
    name: ArcadeTableName | ArcadeTableNextName,
    player: Player,
  ) {
    const state = store.getState().arcadeTables[name]
    let arcadeTable = game.Workspace.ArcadeTables?.[name]
    const arcadeTableCF = arcadeTable?.PrimaryPart?.CFrame
    if (
      state?.status === ArcadeTableStatus.Unmaterialized &&
      state.tableMap &&
      arcadeTable &&
      arcadeTableCF
    ) {
      const baseName = baseArcadeTableName(name)
      store.updateArcadeTableStatus(name, ArcadeTableStatus.Active)
      arcadeTable?.Destroy()
      arcadeTable = this.loadArcadeTableTemplate(state.tableMap, baseName)
      arcadeTable.Name = name
      this.setupArcadeTable(arcadeTable, state, arcadeTableCF)
      const isNextName = isArcadeTableNextName(name)
      if (isNextName) game.Workspace.ArcadeTables?.[baseName]?.Destroy()
      Events.arcadeTableMaterialize.fire(player, name)
      if (arcadeTable.Backbox)
        animateBuildingIn(
          arcadeTable.Backbox,
          new TweenInfo(1, Enum.EasingStyle.Linear, Enum.EasingDirection.Out),
        )?.Wait()
      if ((state?.sequence || 0) % 8 === 0) store.addLoops(player.UserId, 1)
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
