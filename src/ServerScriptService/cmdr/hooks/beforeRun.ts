import type { Registry } from '@rbxts/cmdr'

export = function (registry: Registry) {
  registry.RegisterHook('BeforeRun', (context) => {
    if (game.CreatorId && context.Executor.UserId !== game.CreatorId) {
      return "You don't have permission to run this command"
    }
  })
}
