import { OnStart, Service } from '@flamework/core'
import Object from '@rbxts/object-utils'
import { selectArcadeTablesState } from 'ReplicatedStorage/shared/state'
import { store } from 'ServerScriptService/store'

@Service()
export class ArcadeTableService implements OnStart {
  onStart() {
    const arcadeTablesSelector = selectArcadeTablesState()
    for (;;) {
      task.wait(1)
      const arcadeTablesState = arcadeTablesSelector(store.getState())
      for (const arcadeTableState of Object.values(arcadeTablesState)) {
        if (arcadeTableState.owner)
          store.addScore(arcadeTableState.owner.UserId, 10)
      }
    }
  }
}
