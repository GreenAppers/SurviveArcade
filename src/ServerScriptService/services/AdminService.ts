import { OnStart, Service } from '@flamework/core'
import { Cmdr } from '@rbxts/cmdr'
import { Logger } from '@rbxts/log'
import { ServerScriptService } from '@rbxts/services'

@Service()
export class AdminService implements OnStart {
  operators = new Map<number, string>()

  constructor(private readonly logger: Logger) {}

  onStart() {
    const cmdr = ServerScriptService.FindFirstChild('cmdr') as Folder
    Cmdr.RegisterDefaultCommands()
    Cmdr.RegisterCommandsIn(cmdr.FindFirstChild('commands') as Folder)
    Cmdr.RegisterTypesIn(cmdr.FindFirstChild('types') as Folder)
    Cmdr.RegisterHook('BeforeRun', (context) => {
      if (!this.isAdmin(context.Executor.UserId))
        return "You don't have permission to run this command"
    })
  }

  opUser(target: Player, source: Player) {
    this.operators.set(target.UserId, target.Name)
    this.logger.Info(`${source.Name} has op'd ${target.Name}`)
  }

  deopUser(target: Player, source: Player) {
    this.operators.delete(target.UserId)
    this.logger.Info(`${source.Name} has deop'd ${target.Name}`)
  }

  isAdmin(userId: number) {
    return (
      !game.CreatorId ||
      userId === game.CreatorId ||
      (game.PrivateServerId && game.PrivateServerOwnerId === userId) ||
      this.operators.has(userId)
    )
  }
}
