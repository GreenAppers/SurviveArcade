import { hoarcekat } from '@rbxts/pretty-react-hooks'
import React from '@rbxts/react'

import { RootProvider } from '../../providers/RootProvider'
import { Settings } from '../../sections/Settings'

export = hoarcekat(() => {
  return (
    <RootProvider>
      <Settings />
    </RootProvider>
  )
})
