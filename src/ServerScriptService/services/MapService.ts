import { OnStart, Service } from '@flamework/core'
import Object from '@rbxts/object-utils'
import { ReplicatedStorage, Workspace } from '@rbxts/services'
import {
  ArcadeTablesState,
  ArcadeTableState,
} from 'ReplicatedStorage/shared/state/ArcadeTablesState'
import { store } from 'ServerScriptService/store'
import { getDescendentsWhichAre } from 'ServerScriptService/utils'

@Service()
export class MapService implements OnStart {
  maps: Record<string, ArcadeMap> = {
    Map1: {
      getArcadeTableCFrame: (name) => {
        switch (name) {
          case 'Table1':
            return new CFrame(new Vector3(192.306, 29.057, 0)).mul(
              CFrame.fromOrientation(math.rad(15), math.rad(-90), math.rad(0)),
            )
          case 'Table2':
            return new CFrame(new Vector3(0, 29.057, 192.306)).mul(
              CFrame.fromOrientation(math.rad(15), math.rad(180), math.rad(0)),
            )
          case 'Table3':
            return new CFrame(new Vector3(-192.306, 29.057, 0)).mul(
              CFrame.fromOrientation(math.rad(15), math.rad(90), math.rad(0)),
            )
          case 'Table4':
            return new CFrame(new Vector3(0, 29.057, -192.306)).mul(
              CFrame.fromOrientation(math.rad(15), math.rad(0), math.rad(0)),
            )
        }
      },
    },
    Map2: {
      getArcadeTableCFrame: (name) => {
        const tableOffsetCFrame = new CFrame(
          0.0001983642578125,
          62.376220703125,
          1.47723388671875,
          -1,
          4.170123176893553e-13,
          -3.212539262387182e-11,
          -8.717467719909777e-12,
          0.9659258127212524,
          -0.25881898403167725,
          -3.092281986027956e-11,
          -0.258819043636322,
          -0.9659256935119629,
        )
        const tablePart = game.Workspace.Map?.[name]?.PrimaryPart
        if (!tablePart) return new CFrame()
        return tablePart.CFrame.ToWorldSpace(tableOffsetCFrame)
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
    const parts = getDescendentsWhichAre(arcadeTable, 'BasePart') as BasePart[]
    for (const part of parts) {
      if (part.Name === 'BallTemplate') continue
      if (part.Name === 'Stator') {
        part.BrickColor = state.statorColor
      } else if (part.Name === 'Baseplate') {
        arcadeTable.PrimaryPart = part
      } else if (string.match(part.Name, '^Floor*')[0]) {
        part.BrickColor = state.baseColor
        part.Material = state.baseMaterial
      } else {
        part.BrickColor = state.color
      }
    }
    arcadeTable.Baseplate.BrickColor = state.baseColor
    arcadeTable.Baseplate.Material = state.baseMaterial
    arcadeTable.PivotTo(map.getArcadeTableCFrame(tableName))
    arcadeTable.Parent = Workspace.ArcadeTables
    return arcadeTable
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
      this.loadArcadeTable(map, tableName, state)
    }
  }

  loadMap(mapName: string) {
    this.loadMapWithState(mapName, store.getState().arcadeTables)
  }

  onStart() {
    this.loadMap('Map2')
  }
}
