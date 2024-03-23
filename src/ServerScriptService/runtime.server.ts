import { Flamework } from '@flamework/core'
import { Cmdr } from '@rbxts/cmdr'

const parent = <Folder>script.Parent?.FindFirstChild('cmdr')

Cmdr.RegisterDefaultCommands()
Cmdr.RegisterCommandsIn(<Folder>parent.FindFirstChild('commands'))
Cmdr.RegisterTypesIn(<Folder>parent.FindFirstChild('types'))

Flamework.addPaths('src/ServerScriptService/components')
Flamework.addPaths('src/ServerScriptService/services')
Flamework.ignite()
