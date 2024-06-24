import { hoarcekat } from '@rbxts/pretty-react-hooks'
import React from '@rbxts/react'

import { Events } from '../../../network'
import { RootProvider } from '../../providers/RootProvider'
import { KillLog } from '../../sections/KillLog'

export = hoarcekat(() => {
  Events.message.predict('log', 'Whats up!!', '', new Color3(), new Color3(), 0)
  return (
    <RootProvider>
      <KillLog />
    </RootProvider>
  )
})
