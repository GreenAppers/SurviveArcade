import { createBroadcastReceiver, ProducerMiddleware } from '@rbxts/reflex'
import { Events } from 'StarterPlayer/StarterPlayerScripts/network'

export function receiverMiddleware(): ProducerMiddleware {
  const receiver = createBroadcastReceiver({
    start: () => {
      Events.start.fire()
    },
  })

  Events.dispatch.connect((actions) => receiver.dispatch(actions))

  return receiver.middleware
}
