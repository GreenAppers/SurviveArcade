import { hoarcekat } from '@rbxts/pretty-react-hooks'
import React from '@rbxts/react'

import { RootProvider } from '../../providers/RootProvider'
import { Currency } from '../../sections/Currency'

export = hoarcekat(() => {
  return (
    <RootProvider>
      <Currency />
    </RootProvider>
  )
})
