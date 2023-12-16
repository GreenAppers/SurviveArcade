import { createBroadcaster, ProducerMiddleware } from '@rbxts/reflex'
import { slices } from 'ReplicatedStorage/shared/state'
import { Events } from 'ServerScriptService/network'

export function broadcasterMiddleware(): ProducerMiddleware {
  const broadcaster = createBroadcaster({
    producers: slices,
    dispatch: (player, actions) => {
      Events.dispatch(player, actions)
    },
  })

  Events.start.connect((player) => broadcaster.start(player))

  return broadcaster.middleware
}
