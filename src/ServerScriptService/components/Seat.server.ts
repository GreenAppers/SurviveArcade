import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { store } from 'ServerScriptService/store'
import { getParentPinball, getPinballOwner } from 'ServerScriptService/utils'

@Component({ tag: 'Seat' })
export class SeatComponent extends BaseComponent implements OnStart {
  onStart() {
    const seat = this.instance as Seat
    const pinball = getParentPinball(this.instance)
    seat.GetPropertyChangedSignal('Occupant').Connect(() => {
      //const owner = getPinballOwner(pinball)
      if (!seat.Occupant) {
        //if (!owner) return
        store
          .getActions()
          .claimPinballTable(store.getState(), pinball.Name, undefined)

        /*
		local player = values.OwnerValue.Value
		values.OwnerValue.Value = nil
		player:FindFirstChild("PinballOwned").Value = nil
		player.Team = game:GetService("Teams")["Unclaimed Team"]
		pinball.Parent.Events.Claim:Fire(player, pinball, false)
		local leaderstats = player:FindFirstChild("leaderstats")
		if leaderstats ~= nil then
			local score = leaderstats:FindFirstChild("Score")
			if score ~= nil then
				score.Value = 0
			end
		end
		*/
        return
      }
      //if (owner) return

      const character = seat.Occupant.Parent
      const player = game
        .GetService('Players')
        .GetPlayerFromCharacter(character)
      if (player)
        store
          .getActions()
          .claimPinballTable(store.getState(), pinball.Name, player)

      /*if player and player:FindFirstChild("PinballOwned").Value == nil then
		values.OwnerValue.Value = player
		--mainItems.OwnerDoor.Title.SurfaceGui.TextLabel.Text = tostring(values.OwnerValue.Value).."'s Tycoon"
		player:FindFirstChild("PinballOwned").Value = pinball
		player.Team = game:GetService("Teams")[values.TeamName.Value]
		pinball.Parent.Events.Claim:Fire(player, pinball, true)
	end */
    })
  }
}
