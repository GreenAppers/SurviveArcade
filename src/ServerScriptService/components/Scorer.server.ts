import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'

@Component({ tag: 'Scorer' })
export class MyComponent extends BaseComponent implements OnStart {
  onStart() {
    const part = this.instance as BasePart
    print(`Wow! I'm attached to ${this.instance.GetFullName()}`)
    part.Touched?.Connect((hit) => {
      part.Material = Enum.Material.Neon
      /*
	  local player = utils.getPinballOwner(pinball)
	  if player ~= nil then
  	    utils.addScore(player, 1000)
	  end
	  local audio = pinball:FindFirstChild("Audio")
	  if audio ~= nil then
 	    utils.playSound(part, audio.BouncerSound.SoundId)
	  end
	  */
      task.wait(0.5)
      part.Material = Enum.Material.Plastic
    })
  }
}
