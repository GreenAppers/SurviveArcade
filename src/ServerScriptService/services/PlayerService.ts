import { OnInit, Service } from '@flamework/core'
import { Logger } from '@rbxts/log'
import ProfileService from '@rbxts/profileservice'
import { Profile } from '@rbxts/profileservice/globals'
import { Players, RunService, Teams } from '@rbxts/services'
import { setTimeout } from '@rbxts/set-timeout'
import {
  CURRENCY_EMOJIS,
  CURRENCY_TYPES,
  TEAM_NAMES,
} from 'ReplicatedStorage/shared/constants/core'
import VALUES from 'ReplicatedStorage/shared/constants/values.json'
import { selectPlayerState } from 'ReplicatedStorage/shared/state'
import {
  defaultPlayerData,
  getPlayerData,
  PlayerData,
  PlayerState,
} from 'ReplicatedStorage/shared/state/PlayersState'
import { LeaderboardService } from 'ServerScriptService/services/LeaderboardService'
import { TycoonService } from 'ServerScriptService/services/TycoonService'
import { store } from 'ServerScriptService/store'
import { forEveryPlayer } from 'ServerScriptService/utils/player'

const KEY_TEMPLATE = '%d_Data'
const DataStoreName = RunService.IsStudio() ? 'Testing' : 'Production'

@Service()
export class PlayerService implements OnInit {
  private profileStore = ProfileService.GetProfileStore(
    DataStoreName,
    defaultPlayerData,
  )
  private profiles = new Map<number, Profile<PlayerData>>()

  constructor(
    protected readonly logger: Logger,
    protected readonly tycoonService: TycoonService,
    protected readonly leaderboardService: LeaderboardService,
  ) {}

  onInit() {
    forEveryPlayer(
      (player) => this.handlePlayerJoined(player),
      (player) => this.handlePlayerLeft(player),
    )
  }

  public getProfile(player: Player) {
    return this.profiles.get(player.UserId)
  }

  private handlePlayerLeft(player: Player) {
    const profile = this.profiles.get(player.UserId)
    if (profile?.Data)
      this.leaderboardService.updateDatastoresForPlayer(player, profile.Data)
    this.logger.Info(`Player left ${player.UserId}`)
    profile?.Release()
  }

  private handlePlayerJoined(player: Player) {
    this.logger.Info(`Player joined ${player.UserId}`)
    const profileKey = KEY_TEMPLATE.format(player.UserId)
    const profile = this.profileStore.LoadProfileAsync(profileKey)
    if (!profile) return player.Kick()

    profile.AddUserId(player.UserId)
    profile.Reconcile()
    profile.ListenToRelease(() => {
      this.logger.Info(`Releasing profile ${player.UserId}`)
      this.profiles.delete(player.UserId)
      store.closePlayerData(player.UserId)
      store.resetPlayerTycoon(player.UserId)
      player.Kick()
    })

    if (!player.IsDescendantOf(Players)) {
      profile.Release()
      return
    }

    this.logger.Info(`Player loaded ${player.UserId}`)
    this.profiles.set(player.UserId, profile)
    const state = store.loadPlayerData(player.UserId, profile.Data)
    const playerSelector = selectPlayerState(player.UserId)

    const unsubscribePlayerData = store.subscribe(
      playerSelector,
      (playerState, previousPlayerState) => {
        if (!playerState) return
        profile.Data = getPlayerData(playerState)
        if (!previousPlayerState) return
        this.tycoonService.onPlayerStateChanged(
          player,
          playerState,
          previousPlayerState,
        )
      },
    )
    const unsubscribeLeaderstats = this.createLeaderstatsHandler(
      player,
      playerSelector(state),
    )
    this.createRespawnHandler(player)

    const playerDollars = playerSelector(state)?.dollars ?? 0
    if (playerDollars <= VALUES.GameWelcomeDollars.Value)
      setTimeout(() => {
        store.addPlayerCurrency(
          player.UserId,
          CURRENCY_TYPES.Dollars,
          math.max(0, VALUES.GameWelcomeDollars.Value - playerDollars),
        )
      }, VALUES.GameWelcomeDelay.Value)

    Players.PlayerRemoving.Connect((playerLeft) => {
      if (playerLeft.UserId !== player.UserId) return
      unsubscribePlayerData()
      unsubscribeLeaderstats()
    })
  }

  private createLeaderstatsHandler(player: Player, playerState?: PlayerState) {
    const leaderstats = new Instance('Folder')
    leaderstats.Name = 'leaderstats'
    leaderstats.Parent = player

    const tickets = new Instance('IntValue')
    tickets.Name = `${CURRENCY_EMOJIS.Tickets} ${CURRENCY_TYPES.Tickets}`
    tickets.Value = playerState?.tickets ?? 0
    tickets.Parent = leaderstats

    const dollars = new Instance('IntValue')
    dollars.Name = `${CURRENCY_EMOJIS.Dollars} ${CURRENCY_TYPES.Dollars}`
    dollars.Value = playerState?.dollars ?? 0
    dollars.Parent = leaderstats

    const levity = new Instance('IntValue')
    levity.Name = `${CURRENCY_EMOJIS.Levity} ${CURRENCY_TYPES.Levity}`
    levity.Value = playerState?.levity ?? 0
    levity.Parent = leaderstats

    const unsubscribe = store.subscribe(
      selectPlayerState(player.UserId),
      (playerData) => {
        tickets.Value = playerData?.tickets ?? 0
        dollars.Value = playerData?.dollars ?? 0
        levity.Value = playerData?.levity ?? 0
      },
    )
    return unsubscribe
  }

  private createRespawnHandler(player: Player) {
    player.CharacterAdded.Connect(() => {
      store.resetPlayerScore(player.UserId)
      if (player.Team) player.Team = Teams[TEAM_NAMES.UnclaimedTeam]
    })
  }
}
