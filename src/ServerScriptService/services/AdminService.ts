import { OnStart, Service } from '@flamework/core'
import { Cmdr } from '@rbxts/cmdr'
import { Logger } from '@rbxts/log'
import { ServerScriptService } from '@rbxts/services'

@Service()
export class AdminService implements OnStart {
  operators = new Map<number, string>([
    [game.CreatorId, 'GreenAppers'],
    [4771762595, 'AngleOpera'],
    [5263028589, 'CreeperFace77777'],
  ])

  constructor(private readonly logger: Logger) {}

  onStart() {
    const cmdr = ServerScriptService.FindFirstChild<Folder>('cmdr')!
    Cmdr.RegisterDefaultCommands()
    Cmdr.RegisterCommandsIn(cmdr.FindFirstChild<Folder>('commands')!)
    Cmdr.RegisterTypesIn(cmdr.FindFirstChild<Folder>('types')!)
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
      (game.PrivateServerId && game.PrivateServerOwnerId === userId) ||
      this.operators.has(userId)
    )
  }
}
