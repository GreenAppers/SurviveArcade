import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { ReplicatedStorage } from '@rbxts/services'
import { VehicleSpawnerTag } from 'ReplicatedStorage/shared/constants/tags'
import { selectTycoonState } from 'ReplicatedStorage/shared/state'
import { getTycoonFromDescendent } from 'ReplicatedStorage/shared/utils/tycoon'
import { PlayerService } from 'ServerScriptService/services/PlayerService'
import { store } from 'ServerScriptService/store'

@Component({ tag: VehicleSpawnerTag })
export class VehicleSpawnerComponent
  extends BaseComponent<{}, VehicleSpawner>
  implements OnStart
{
  constructor(protected playerService: PlayerService) {
    super()
  }

  onStart() {
    this.instance.Spawn.OnServerEvent.Connect((player) => {
      const tycoon = getTycoonFromDescendent(this.instance)
      if (!tycoon) return

      const ownerUserId = store.getState(selectTycoonState(tycoon.Name)).owner
      if (ownerUserId !== player.UserId) return

      const vehicles = this.playerService.getPlayerSpace(player).Vehicles
      for (const vehicle of vehicles.GetChildren()) vehicle.Destroy()

      const vehicle = ReplicatedStorage.Vehicles.Airplane.Clone()
      vehicle.PivotTo(
        this.instance.Screen.CFrame.ToWorldSpace(
          new CFrame(new Vector3(20, 0, 0), new Vector3(19, 0, 0)),
        ),
      )
      vehicle.Parent = vehicles
    })
  }
}
