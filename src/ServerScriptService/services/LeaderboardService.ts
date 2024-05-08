import { OnStart, Service } from '@flamework/core'
import { DataStoreService, Players, Workspace } from '@rbxts/services'
import { selectPlayerState } from 'ReplicatedStorage/shared/state'
import { PlayerData } from 'ReplicatedStorage/shared/state/PlayersState'
import { store } from 'ServerScriptService/store'

@Service()
export class LeaderboardService implements OnStart {
  leaderboardUpdateSeconds = 5 * 60
  leaderboardUpdateLast = 0
  datastoreDollars: OrderedDataStore | undefined
  datastoreLevity: OrderedDataStore | undefined
  datascoreUpdateSeconds = 5 * 60
  datascoreUpdateLast = DateTime.now().UnixTimestamp

  onStart() {
    if (!game.PlaceId) return
    this.datastoreDollars =
      DataStoreService.GetOrderedDataStore('LeaderboardDollars')
    this.datastoreLevity =
      DataStoreService.GetOrderedDataStore('LeaderboardLevity')
    for (;;) {
      const now = DateTime.now().UnixTimestamp
      if (now - this.leaderboardUpdateLast >= this.leaderboardUpdateSeconds)
        this.updateLeaderboards()
      if (now - this.datascoreUpdateLast >= this.datascoreUpdateSeconds)
        this.updateDatastores()
      task.wait(5)
    }
  }

  updateDatastores() {
    const state = store.getState()
    for (const player of Players.GetPlayers()) {
      const playerState = selectPlayerState(player.UserId)(state)
      if (playerState) this.updateDatastoresForPlayer(player, playerState)
    }
  }

  updateDatastoresForPlayer(player: Player, playerState: PlayerData) {
    if (this.datastoreLevity && playerState.levity > 0)
      this.datastoreLevity.SetAsync(`${player.UserId}`, playerState.levity)
  }

  updateLeaderboards() {
    this.updateLeaderboard(
      Workspace.Map.LeaderboardLevity,
      this.datastoreLevity,
    )
  }

  updateLeaderboard(leaderboard: Leaderboard, datastore?: OrderedDataStore) {
    if (!datastore) return
    const template = leaderboard.Leaderboard.ItemTemplate
    const container = leaderboard.Leaderboard.SurfaceGui.Frame.List
    for (const child of container.GetChildren()) {
      if (child.IsA('Frame')) child.Destroy()
    }
    const data = datastore.GetSortedAsync(false, 50)
    const page = data.GetCurrentPage()
    let rankInLB = 1
    for (const dataStored of page) {
      const playerId = tonumber(dataStored.key) || 0
      if (!playerId) continue
      const name = Players.GetNameFromUserIdAsync(playerId)
      const image = Players.GetUserThumbnailAsync(
        playerId,
        Enum.ThumbnailType.HeadShot,
        Enum.ThumbnailSize.Size100x100,
      )
      const item = template.Clone()
      item.Name = name + 'Leaderboard'
      item.PlayerName.Text = name
      item.Rank.Text = `#${rankInLB++}`
      item.Value.Text = `${dataStored.value}`
      item.Parent = script.Parent
      if (image[1]) item.Photo.Image = image[0]
    }
  }
}
