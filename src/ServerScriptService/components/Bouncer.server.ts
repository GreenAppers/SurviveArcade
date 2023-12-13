import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import {
  addScore,
  getParentPinball,
  getPinballOwner,
  playSound,
} from 'ServerScriptService/utils'

@Component({ tag: 'Bouncer' })
export class BouncerComponent extends BaseComponent implements OnStart {
  onStart() {
    const part = this.instance as BasePart
    const pinball = getParentPinball(this.instance)
    print(`Wow! I'm attached to ${this.instance.GetFullName()}`)
    part.Touched?.Connect((hit) => {
      part.Material = Enum.Material.Neon

      const player = getPinballOwner(pinball)
      if (player) addScore(player, 1000)

      const audio = pinball.FindFirstChild('Audio') as
        | { BouncerSound: Sound }
        | undefined
      if (audio) playSound(part, audio.BouncerSound.SoundId)

      const humanoid = hit.Parent?.FindFirstChild('Humanoid') as
        | Humanoid
        | undefined
      if (humanoid) {
        //local touchedPlayer = game.Players:GetPlayerFromCharacter(hit.Parent)
        //workspace.PinballTables.Events.BouncePlayer:FireClient(touchedPlayer, part.Position)
      }

      task.wait(0.5)
      part.Material = Enum.Material.Plastic
    })
  }
}
