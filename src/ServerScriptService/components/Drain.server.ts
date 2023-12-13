import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'

@Component({ tag: 'Drain' })
export class DrainComponent extends BaseComponent implements OnStart {
  onStart() {
    const drain = this.instance as BasePart
    print(`Wow! I'm attached to ${this.instance.GetFullName()}`)
    drain.Touched?.Connect((part) => {
      if (part.Parent?.Name !== 'Balls') return

      /*
	if values.OwnerValue.Value ~= nil then
		local player = values.OwnerValue.Value
		player.Character.Humanoid.Health = 0
		local leaderstats = player:FindFirstChild("leaderstats")
		if leaderstats ~= nil then
			local score = leaderstats:FindFirstChild("Score")
			if score ~= nil then
				score.Value = 0
			end
		end
	end
	*/

      task.wait(0.5)
      part.Destroy()
    })
  }
}
