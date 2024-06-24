import { hoarcekat } from '@rbxts/pretty-react-hooks'
import React from '@rbxts/react'

import { store } from '../../../store'
import { RootProvider } from '../../providers/RootProvider'
import { PlayerList } from '../../sections/PlayerList'

export = hoarcekat(() => {
  store.setPlayerList(true)
  store.addNPC(-103, 'Cameraman')
  return (
    <RootProvider>
      <PlayerList />
    </RootProvider>
  )
})
