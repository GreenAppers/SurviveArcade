import { Dependency } from '@flamework/core'
import { CommandContext } from '@rbxts/cmdr'
import { AdminService } from 'ServerScriptService/services/AdminService'

export = function (context: CommandContext, player: Player) {
  if (player.UserId) {
    const adminService = Dependency<AdminService>()
    adminService.deopUser(player, context.Executor)
  }
}
