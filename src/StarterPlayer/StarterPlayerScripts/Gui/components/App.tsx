import Roact from '@rbxts/roact'
import { Layer } from 'StarterPlayer/StarterPlayerScripts/Gui/components/Layer'

import { Alerts } from './Alerts'
import { ErrorHandler } from './ErrorHandler'
import { Stats } from './Stats'

export function App() {
  return (
    <ErrorHandler>
      <Layer key="menu-layer">
        <Stats key="stats" />
      </Layer>

      <Layer key="modal-layer">
        <Alerts key="alerts" />
      </Layer>
    </ErrorHandler>
  )
}
