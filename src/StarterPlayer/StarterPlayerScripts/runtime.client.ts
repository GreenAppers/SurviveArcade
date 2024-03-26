import { Flamework, Modding } from '@flamework/core'
import { CmdrClient } from '@rbxts/cmdr'
import Log, { Logger } from '@rbxts/log'

Log.SetLogger(Logger.configure().WriteTo(Log.RobloxOutput()).Create())
Modding.registerDependency<Logger>((ctor) => Log.ForContext(ctor))

CmdrClient.SetActivationKeys([Enum.KeyCode.F2])

Flamework.addPaths('src/StarterPlayer/StarterPlayerScripts/components')
Flamework.addPaths('src/StarterPlayer/StarterPlayerScripts/controllers')
Flamework.ignite()
