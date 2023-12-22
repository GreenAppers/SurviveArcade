import { Flamework } from '@flamework/core'
import { CmdrClient } from '@rbxts/cmdr'

CmdrClient.SetActivationKeys([Enum.KeyCode.F2])

Flamework.addPaths('src/StarterPlayer/StarterPlayerScripts/components')
Flamework.addPaths('src/StarterPlayer/StarterPlayerScripts/controllers')
Flamework.ignite()
