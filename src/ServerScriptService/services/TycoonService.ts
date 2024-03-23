import { OnStart, Service } from '@flamework/core'
import { ReplicatedStorage, Workspace } from '@rbxts/services'
import { TYCOON_TYPES } from 'ReplicatedStorage/shared/constants/core'
import { selectTycoonsState } from 'ReplicatedStorage/shared/state'
import { TycoonState } from 'ReplicatedStorage/shared/state/TycoonState'
import { store } from 'ServerScriptService/store'
import { getDescendentsWhichAre } from 'ServerScriptService/utils'

@Service()
export class TycoonService implements OnStart {
  tycoonType = TYCOON_TYPES.Elf

  loadTycoonTemplate(tycoonType: TycoonType, tycoonName: TycoonName) {
    const tycoonTemplate = ReplicatedStorage.Tycoons[tycoonType]
    const tycoon = tycoonTemplate.Clone()
    tycoon.Name = tycoonName
    return tycoon
  }

  loadTycoon(map: ArcadeMap, tycoonName: TycoonName, state: TycoonState) {
    const tycoon = this.loadTycoonTemplate(map.getTycoonType(), tycoonName)
    this.setupTycoon(tycoon, state, map.getTycoonCFrame(tycoonName))
    return tycoon
  }

  setupTycoon(tycoon: Tycoon, state: TycoonState, cframe?: CFrame) {
    const parts = getDescendentsWhichAre(tycoon, 'BasePart') as BasePart[]
    for (const part of parts) {
      if (part.Name === 'Baseplate') {
        tycoon.PrimaryPart = part
      }
    }
    if (cframe) tycoon.PivotTo(cframe)
    tycoon.Parent = Workspace.Tycoons
  }

  onStart() {}

  resetTycoon(name: TycoonName) {
    const tycoonsState = selectTycoonsState()(store.getState())
    const tycoonState = tycoonsState[name]
    const tycoon = <Tycoon>game.Workspace.Tycoons?.FindFirstChild(name)
    tycoon?.Destroy()
    store.resetTycoon(name)
  }
}
