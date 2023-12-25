import { OnStart, Service } from '@flamework/core'
import Object from '@rbxts/object-utils'
import { ReplicatedStorage, Workspace } from '@rbxts/services'
import {
  ArcadeTablesState,
  ArcadeTableState,
  ArcadeTableStatus,
  baseArcadeTableName,
  isArcadeTableNextName,
  nextArcadeTableName,
} from 'ReplicatedStorage/shared/state/ArcadeTablesState'
import { store } from 'ServerScriptService/store'
import { getDescendentsWhichAre } from 'ServerScriptService/utils'

@Service()
export class MapService implements OnStart {
  maps: Record<string, ArcadeMap> = {
    Map1: {
      getArcadeTableCFrame: (name) => {
        return game.Workspace.Map?.[name]?.Baseplate?.CFrame || new CFrame()
      },
    },
  }

  clearMap() {
    Workspace.ArcadeTables.ClearAllChildren()
    Workspace.Map?.Destroy()
  }

  loadArcadeTableTemplate(name: ArcadeTableType, tableName: ArcadeTableName) {
    const arcadeTableTemplate = ReplicatedStorage.ArcadeTables[name]
    const arcadeTable = arcadeTableTemplate.Clone()
    arcadeTable.Name = tableName
    return arcadeTable
  }

  loadArcadeTable(
    map: ArcadeMap,
    tableName: ArcadeTableName,
    state: ArcadeTableState,
  ) {
    if (!state.tableType) return
    const arcadeTable = this.loadArcadeTableTemplate(state.tableType, tableName)
    this.setupArcadeTable(
      arcadeTable,
      state,
      map.getArcadeTableCFrame(tableName),
    )
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

  loadMapWithState(mapName: string, arcadeTablesState: ArcadeTablesState) {
    this.clearMap()
    const map = this.maps[mapName]
    if (!map) return

    const mapModelTemplate = ReplicatedStorage.Maps[mapName]
    if (!mapModelTemplate) return

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

  loadMap(mapName: string) {
    this.loadMapWithState(mapName, store.getState().arcadeTables)
  }

  onStart() {
    this.loadMap('Map1')
  }

  materializeTable(name: ArcadeTableName | ArcadeTableNextName) {
    const state = store.getState().arcadeTables[name]
    let arcadeTable = game.Workspace.ArcadeTables?.[name]
    const arcadeTableCF = arcadeTable?.PrimaryPart?.CFrame
    if (
      state?.status === ArcadeTableStatus.Unmaterialized &&
      state.tableType &&
      arcadeTable &&
      arcadeTableCF
    ) {
      store.updateArcadeTableStatus(name, ArcadeTableStatus.Active)
      arcadeTable?.Destroy()
      arcadeTable = this.loadArcadeTableTemplate(
        state.tableType,
        baseArcadeTableName(name),
      )
      arcadeTable.Name = name
      this.setupArcadeTable(arcadeTable, state, arcadeTableCF)
    }
  }

  chainNextTable(name: ArcadeTableName | ArcadeTableNextName) {
    const isNextName = isArcadeTableNextName(name)
    const arcadeTableBaseName = baseArcadeTableName(name)
    const arcadeTableNextName = nextArcadeTableName(name)
    const state = store.getState().arcadeTables[arcadeTableBaseName]
    let arcadeTable = game.Workspace.ArcadeTables?.[arcadeTableBaseName]
    let arcadeTableNext = <ArcadeTable | undefined>(
      game.Workspace.ArcadeTables?.FindFirstChild(arcadeTableNextName)
    )
    if (!arcadeTable || !state?.tableType) return
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
      state.tableType,
      arcadeTableBaseName,
    )
    arcadeTableNext.Name = arcadeTableNextName
    this.setupNextArcadeTable(arcadeTableNext, nextArcadeTableCF)
  }
}
