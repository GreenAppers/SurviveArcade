import { OnInit, Service } from '@flamework/core'
import { Logger } from '@rbxts/log'
import ProfileService from '@rbxts/profileservice'
import { Profile } from '@rbxts/profileservice/globals'
import { Players, RunService, Teams, Workspace } from '@rbxts/services'
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
import { getNameFromUserId } from 'ReplicatedStorage/shared/utils/player'
import { Events } from 'ServerScriptService/network'
import { LeaderboardService } from 'ServerScriptService/services/LeaderboardService'
import { TransactionService } from 'ServerScriptService/services/TransactionService'
import { TycoonService } from 'ServerScriptService/services/TycoonService'
import { store } from 'ServerScriptService/store'
import {
  forEveryPlayer,
  getAttackerUserId,
} from 'ServerScriptService/utils/player'

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
    protected readonly transactionService: TransactionService,
  ) {}

  onInit() {
    game.Workspace.Cutscenes.LoadedServer.OnServerEvent.Connect((player) =>
      this.handlePlayerLoaded(player),
    )
    forEveryPlayer(
      (player) => this.handlePlayerJoined(player),
      (player) => this.handlePlayerLeft(player),
    )
  }

  public getProfile(player: Player) {
    return this.profiles.get(player.UserId)
  }

  public getPlayerSpace(player: Player): PlayerSpace {
    const key = `${player.UserId}`
    const existing = Workspace.PlayerSpaces.FindFirstChild(key)
    if (existing) return existing as PlayerSpace
    const folder = new Instance('Folder')
    folder.Name = key
    const placedBlocks = new Instance('Model')
    placedBlocks.Name = 'PlacedBlocks'
    placedBlocks.Parent = folder
    const placeBlockPreview = new Instance('Model')
    placeBlockPreview.Name = 'PlaceBlockPreview'
    placeBlockPreview.Parent = folder
    const vehicles = new Instance('Folder')
    vehicles.Name = 'Vehicles'
    vehicles.Parent = folder
    folder.Parent = Workspace.PlayerSpaces
    return folder as PlayerSpace
  }

  private cleanupPlayerSpace(player: Player) {
    const key = `${player.UserId}`
    const existing = Workspace.PlayerSpaces.FindFirstChild(key)
    if (existing) existing.Destroy()
  }

  private handlePlayerLeft(player: Player) {
    this.cleanupPlayerSpace(player)
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
    const state = store.loadPlayerData(player.UserId, player.Name, profile.Data)
    const playerSelector = selectPlayerState(player.UserId)

    this.getPlayerSpace(player)
    Promise.try(() =>
      this.transactionService.reloadPlayerGamePasses(player, player.UserId),
    )

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

    Players.PlayerRemoving.Connect((playerLeft) => {
      if (playerLeft.UserId !== player.UserId) return
      unsubscribePlayerData()
      unsubscribeLeaderstats()
    })
  }

  private handlePlayerLoaded(player: Player) {
    const playerState = store.getState(selectPlayerState(player.UserId))
    const playerDollars = playerState?.dollars ?? 0

    if (playerDollars <= VALUES.GameWelcomeDollars.Value)
      setTimeout(() => {
        store.addPlayerCurrency(
          player.UserId,
          CURRENCY_TYPES.Dollars,
          math.max(0, VALUES.GameWelcomeDollars.Value - playerDollars),
        )
      }, VALUES.GameWelcomeDelay.Value)
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
    player.CharacterAdded.Connect((characterModel) => {
      store.resetPlayerScore(player.UserId)
      if (player.Team) player.Team = Teams[TEAM_NAMES.UnclaimedTeam]

      const humanoid = (characterModel as PlayerCharacter).Humanoid
      humanoid.Died.Connect(() =>
        this.handleKO(humanoid, player.UserId, player.Name),
      )
    })
  }

  public handleKO(
    humanoid: Humanoid,
    playerUserId: number,
    playerName: string,
  ) {
    const attackerUserId = getAttackerUserId(humanoid)
    let message
    if (attackerUserId) {
      store.addPlayerKOs(attackerUserId, 1)
      message = `${playerName} was KO'd by ${getNameFromUserId(attackerUserId, game.Workspace)}`
    } else if ((humanoid.RootPart?.Position?.Y ?? 0) < -30) {
      message = `${playerName} fell to their doom`
    } else {
      message = `${playerName} was KO'd`
    }
    store.addPlayerKOd(playerUserId, 0)
    Events.message.broadcast('log', message)
  }
}
