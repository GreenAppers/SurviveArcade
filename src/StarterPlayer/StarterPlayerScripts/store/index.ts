import { combineProducers, InferState } from '@rbxts/reflex'
import { slices } from 'ReplicatedStorage/shared/state'
import { receiverMiddleware } from 'StarterPlayer/StarterPlayerScripts/store/middleware/receiver'

export type RootStore = typeof store

export type RootState = InferState<RootStore>

export function createStore() {
  const store = combineProducers({
    ...slices,
  })

  store.applyMiddleware(receiverMiddleware())

  return store
}

export const store = createStore()
