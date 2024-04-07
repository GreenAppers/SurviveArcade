import Roact from '@rbxts/roact'
import { ErrorHandler } from 'StarterPlayer/StarterPlayerScripts/Gui/components/ErrorHandler'
import { Layer } from 'StarterPlayer/StarterPlayerScripts/Gui/components/Layer'
import { Alerts } from 'StarterPlayer/StarterPlayerScripts/Gui/sections/Alerts'
import { Currency } from 'StarterPlayer/StarterPlayerScripts/Gui/sections/Currency'
import { GameStatus } from 'StarterPlayer/StarterPlayerScripts/Gui/sections/GameStatus'
import { Music } from 'StarterPlayer/StarterPlayerScripts/Gui/sections/Music'
import { Settings } from 'StarterPlayer/StarterPlayerScripts/Gui/sections/Settings'

export function App() {
  return (
    <ErrorHandler>
      <Music key="music" />

      <Layer key="menu-layer">
        <Currency key="currency" />
        <GameStatus key="game-status" />
        <Settings key="settings" />
      </Layer>

      <Layer key="modal-layer">
        <Alerts key="alerts" />
      </Layer>
    </ErrorHandler>
  )
}
