import { Flamework } from '@flamework/core'
import { Cmdr } from '@rbxts/cmdr'

Cmdr.RegisterDefaultCommands()

Flamework.addPaths('src/ServerScriptService/components')
Flamework.addPaths('src/ServerScriptService/services')
Flamework.ignite()
