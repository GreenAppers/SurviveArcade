import { combineProducers, InferState } from '@rbxts/reflex'
import { slices } from 'ReplicatedStorage/shared/state'
import { broadcasterMiddleware } from 'ServerScriptService/store/middleware/broadcaster'

export type RootState = InferState<typeof store>

export function createStore() {
  const store = combineProducers({
    ...slices,
  })

  // Apply middleware
  store.applyMiddleware(broadcasterMiddleware())

  return store
}

export const store = createStore()
