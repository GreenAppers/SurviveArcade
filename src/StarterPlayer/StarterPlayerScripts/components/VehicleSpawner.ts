import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { VehicleSpawnerTag } from 'ReplicatedStorage/shared/constants/tags'

@Component({ tag: VehicleSpawnerTag })
export class VehicleSpawnerComponent
  extends BaseComponent<{}, VehicleSpawner>
  implements OnStart
{
  onStart() {
    this.instance.Screen.Spawn.Frame.TextButton.MouseButton1Click.Connect(() =>
      this.instance.Spawn.FireServer(),
    )
  }
}
