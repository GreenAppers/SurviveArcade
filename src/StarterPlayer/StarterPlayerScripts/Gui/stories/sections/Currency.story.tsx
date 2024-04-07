import { hoarcekat } from '@rbxts/pretty-react-hooks'
import Roact from '@rbxts/roact'

import { RootProvider } from '../../providers/RootProvider'
import { Currency } from '../../sections/Currency'

export = hoarcekat(() => {
  return (
    <RootProvider>
      <Currency key="currency" />
    </RootProvider>
  )
})
