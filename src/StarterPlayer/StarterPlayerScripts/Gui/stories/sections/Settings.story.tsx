import { hoarcekat } from '@rbxts/pretty-react-hooks'
import Roact from '@rbxts/roact'

import { RootProvider } from '../../providers/RootProvider'
import { Settings } from '../../sections/Settings'

export = hoarcekat(() => {
  return (
    <RootProvider>
      <Settings key="settings" />
    </RootProvider>
  )
})
