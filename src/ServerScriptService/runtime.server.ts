import { Flamework, Modding } from '@flamework/core'
import { Cmdr } from '@rbxts/cmdr'
import Log, { Logger } from '@rbxts/log'

Log.SetLogger(Logger.configure().WriteTo(Log.RobloxOutput()).Create())
Modding.registerDependency<Logger>((ctor) => Log.ForContext(ctor))

const parent = <Folder>script.Parent?.FindFirstChild('cmdr')
Cmdr.RegisterDefaultCommands()
Cmdr.RegisterCommandsIn(<Folder>parent.FindFirstChild('commands'))
Cmdr.RegisterTypesIn(<Folder>parent.FindFirstChild('types'))

Flamework.addPaths('src/ServerScriptService/components')
Flamework.addPaths('src/ServerScriptService/services')
Flamework.ignite()
