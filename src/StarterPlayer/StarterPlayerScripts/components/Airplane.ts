import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { AirplaneTag } from 'ReplicatedStorage/shared/constants/tags'
import { AirplaneController } from 'StarterPlayer/StarterPlayerScripts/controllers/AirplaneController'
import { createBulletAdjuster } from 'StarterPlayer/StarterPlayerScripts/utils/part'

@Component({ tag: AirplaneTag })
export class PlaneComponent
  extends BaseComponent<{}, Airplane>
  implements OnStart
{
  config: AirplaneConfig = {
    gunsEnabled: true,
    speed: 120,
    turnSpeed: 10,
  }

  constructor(protected planeController: AirplaneController) {
    super()
  }

  onStart() {
    const plane = this.instance
    plane.Seat.GetPropertyChangedSignal('Occupant').Connect(() => {
      if (plane.Seat.Occupant)
        this.planeController.startPlane(plane, this.config)
      else this.planeController.stopPlane(plane)
    })

    if (plane.Guns) {
      for (const gun of [plane.Guns.Gun1, plane.Guns.Gun2]) {
        createBulletAdjuster(gun.Muzzle, gun)
      }
    }
  }
}
