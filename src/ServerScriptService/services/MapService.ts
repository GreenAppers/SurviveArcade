import { OnStart, Service } from '@flamework/core'
import Object from '@rbxts/object-utils'
import { ReplicatedStorage, Workspace } from '@rbxts/services'
import {
  ArcadeTableState,
  ArcadeTablesState,
} from 'ReplicatedStorage/shared/state/ArcadeTablesState'
import { store } from 'ServerScriptService/store'
import { getDescendentsWhichAre } from 'ServerScriptService/utils'

@Service()
export class MapService implements OnStart {
  maps: Record<string, ArcadeMap> = {
    map1: {
      arcadeTableCFrames: {
        Table1: new CFrame(new Vector3(192.306, 29.057, 0)).mul(
          CFrame.fromOrientation(math.rad(15), math.rad(-90), math.rad(0)),
        ),
        Table2: new CFrame(new Vector3(0, 29.057, 192.306)).mul(
          CFrame.fromOrientation(math.rad(15), math.rad(180), math.rad(0)),
        ),
        Table3: new CFrame(new Vector3(-192.306, 29.057, 0)).mul(
          CFrame.fromOrientation(math.rad(15), math.rad(90), math.rad(0)),
        ),
        Table4: new CFrame(new Vector3(0, 29.057, -192.306)).mul(
          CFrame.fromOrientation(math.rad(15), math.rad(0), math.rad(0)),
        ),
      },
    },
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
    arcadeTable.PivotTo(map.arcadeTableCFrames[tableName])
    arcadeTable.Parent = Workspace.ArcadeTables
    return arcadeTable
  }

  loadMapWithState(mapName: string, arcadeTablesState: ArcadeTablesState) {
    const map = this.maps[mapName]
    if (!map) return
    for (const [tableName, state] of Object.entries(arcadeTablesState)) {
      this.loadArcadeTable(map, tableName, state)
    }
  }

  loadMap(mapName: string) {
    this.loadMapWithState(mapName, store.getState().arcadeTables)
  }

  onStart() {
    this.loadMap('map1')
  }
}
