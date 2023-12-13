import { OnInit, Service } from '@flamework/core'
import ProfileService from '@rbxts/profileservice'
import { Profile } from '@rbxts/profileservice/globals'
import { Players, RunService } from '@rbxts/services'
import { selectPlayerState } from 'ReplicatedStorage/shared/state'
import {
  PlayerData,
  defaultPlayerData,
} from 'ReplicatedStorage/shared/state/PlayersState'
import { store } from 'ServerScriptService/store'
import { forEveryPlayer } from 'ServerScriptService/utils'

const KEY_TEMPLATE = '%d_Data'
const DataStoreName = RunService.IsStudio() ? 'Testing' : 'Production'

@Service()
export class PlayerDataService implements OnInit {
  private profileStore = ProfileService.GetProfileStore(
    DataStoreName,
    defaultPlayerData,
  )
  private profiles = new Map<Player, Profile<PlayerData>>()

  onInit() {
    forEveryPlayer(
      (player) => this.createProfile(player),
      (player) => this.removeProfile(player),
    )
  }

  private createProfile(player: Player) {
    const userId = player.UserId
    const profileKey = KEY_TEMPLATE.format(userId)
    const profile = this.profileStore.LoadProfileAsync(profileKey)
    if (!profile) return player.Kick()

    profile.ListenToRelease(() => {
      this.profiles.delete(player)
      store.closePlayerData(player.UserId)
      player.Kick()
    })

    profile.AddUserId(userId)
    profile.Reconcile()

    this.profiles.set(player, profile)
    store.loadPlayerData(player.UserId, profile.Data)
    this.createLeaderstats(player)

    const unsubscribe = store.subscribe(
      selectPlayerState(player.UserId),
      (playerData) => {
        if (playerData) profile.Data = playerData
      },
    )
    Players.PlayerRemoving.Connect((player) => {
      if (player === player) unsubscribe()
    })
  }

  private createLeaderstats(player: Player) {
    const leaderstats = new Instance('Folder')
    leaderstats.Name = 'leaderstats'
    leaderstats.Parent = player

    const score = new Instance('IntValue')
    score.Name = 'Score'
    score.Value = 0
    score.Parent = leaderstats

    const highScore = new Instance('IntValue')
    highScore.Name = 'High'
    highScore.Value = 0
    highScore.Parent = leaderstats

    const unsubscribe = store.subscribe(
      selectPlayerState(player.UserId),
      (playerData) => {
        score.Value = playerData?.score?.score ?? 0
        highScore.Value = playerData?.score?.highScore ?? 0
      },
    )
    Players.PlayerRemoving.Connect((player) => {
      if (player === player) unsubscribe()
    })
  }

  private removeProfile(player: Player) {
    const profile = this.profiles.get(player)
    profile?.Release()
  }

  public getProfile(player: Player) {
    return this.profiles.get(player)
  }
}
