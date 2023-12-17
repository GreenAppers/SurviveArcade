import { hoarcekat } from '@rbxts/pretty-react-hooks'
import Roact from '@rbxts/roact'

import { RootProvider } from '../..//providers/RootProvider'
import { Stats } from '../../components/Stats'

export = hoarcekat(() => {
  return (
    <RootProvider>
      <Stats key="stats" />
    </RootProvider>
  )
})
