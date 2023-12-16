import Roact from '@rbxts/roact'
import { Layer } from 'StarterPlayer/StarterPlayerScripts/Gui/components/Layer'
import { Status } from 'StarterPlayer/StarterPlayerScripts/Gui/components/Status'

export function App() {
  return (
    <Layer>
      <frame
        Size={new UDim2(0.2, 0, 0.2, 0)}
        Position={new UDim2(0.02, 0, 0.1, 0)}
      >
        <Status />
      </frame>
    </Layer>
  )
}
