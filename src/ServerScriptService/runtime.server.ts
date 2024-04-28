import { Flamework, Modding } from '@flamework/core'
import { Cmdr } from '@rbxts/cmdr'
import Log, { Logger } from '@rbxts/log'

Log.SetLogger(Logger.configure().WriteTo(Log.RobloxOutput()).Create())
Modding.registerDependency<Logger>((ctor) => Log.ForContext(ctor))

const parent = script.Parent?.FindFirstChild('cmdr') as Folder
Cmdr.RegisterDefaultCommands()
Cmdr.RegisterCommandsIn(parent.FindFirstChild('commands') as Folder)
Cmdr.RegisterTypesIn(parent.FindFirstChild('types') as Folder)
Cmdr.RegisterHooksIn(parent.FindFirstChild('hooks') as Folder)

Flamework.addPaths('src/ServerScriptService/components')
Flamework.addPaths('src/ServerScriptService/services')
Flamework.ignite()
