import { Flamework, Modding } from '@flamework/core'
import Log, { Logger } from '@rbxts/log'
import { ScriptContext } from '@rbxts/services'

Log.SetLogger(Logger.configure().WriteTo(Log.RobloxOutput()).Create())
ScriptContext.Error.Connect((message, stack) => {
  Log.Error(message)
  Log.Error(stack)
})

Modding.registerDependency<Logger>((ctor) => Log.ForContext(ctor))
Flamework.addPaths('src/ServerScriptService/components')
Flamework.addPaths('src/ServerScriptService/services')
Flamework.ignite()
