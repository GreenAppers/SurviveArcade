import { OnInit, Service } from '@flamework/core'
import ProfileService from '@rbxts/profileservice'
import { Profile } from '@rbxts/profileservice/globals'
import { Players, RunService, Teams } from '@rbxts/services'
import { selectPlayerState } from 'ReplicatedStorage/shared/state'
import {
  defaultPlayerData,
  getPlayerData,
  PlayerData,
} from 'ReplicatedStorage/shared/state/PlayersState'
import { store } from 'ServerScriptService/store'
import { forEveryPlayer } from 'ServerScriptService/utils'

const KEY_TEMPLATE = '%d_Data'
const DataStoreName = RunService.IsStudio() ? 'Testing' : 'Production'

@Service()
export class PlayerService implements OnInit {
  private profileStore = ProfileService.GetProfileStore(
    DataStoreName,
    defaultPlayerData,
  )
  private profiles = new Map<Player, Profile<PlayerData>>()

  onInit() {
    forEveryPlayer(
      (player) => this.handlePlayerJoined(player),
      (player) => this.handlePlayerLeft(player),
    )
  }

  public getProfile(player: Player) {
    return this.profiles.get(player)
  }

  private handlePlayerLeft(player: Player) {
    const profile = this.profiles.get(player)
    profile?.Release()
  }

  private handlePlayerJoined(player: Player) {
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
    const unsubscribePlayerData = store.subscribe(
      selectPlayerState(player.UserId),
      (playerState) => {
        if (playerState) profile.Data = getPlayerData(playerState)
      },
    )

    const unsubscribeLeaderstats = this.createLeaderstats(player)
    this.createRespawn(player)

    Players.PlayerRemoving.Connect((player) => {
      if (player !== player) return
      unsubscribePlayerData()
      unsubscribeLeaderstats()
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

    const loops = new Instance('IntValue')
    loops.Name = 'Loops'
    loops.Value = 0
    loops.Parent = leaderstats

    const unsubscribe = store.subscribe(
      selectPlayerState(player.UserId),
      (playerData) => {
        score.Value = playerData?.score?.highScore ?? 0
        loops.Value = playerData?.score?.loops ?? 0
      },
    )
    return unsubscribe
  }

  private createRespawn(player: Player) {
    player.CharacterAdded.Connect(() => {
      store.resetScore(player.UserId)
      player.Team = Teams['Unclaimed Team']
    })
  }
}
