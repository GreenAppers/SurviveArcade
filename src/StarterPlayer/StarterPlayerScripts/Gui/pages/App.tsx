import React from '@rbxts/react'
import { ErrorHandler } from 'StarterPlayer/StarterPlayerScripts/Gui/components/ErrorHandler'
import { Layer } from 'StarterPlayer/StarterPlayerScripts/Gui/components/Layer'
import { Alerts } from 'StarterPlayer/StarterPlayerScripts/Gui/sections/Alerts'
import { Currency } from 'StarterPlayer/StarterPlayerScripts/Gui/sections/Currency'
import { GameStatus } from 'StarterPlayer/StarterPlayerScripts/Gui/sections/GameStatus'
import { KillLog } from 'StarterPlayer/StarterPlayerScripts/Gui/sections/KillLog'
import { Music } from 'StarterPlayer/StarterPlayerScripts/Gui/sections/Music'
import { PlayerList } from 'StarterPlayer/StarterPlayerScripts/Gui/sections/PlayerList'
import { Settings } from 'StarterPlayer/StarterPlayerScripts/Gui/sections/Settings'

export function App() {
  return (
    <ErrorHandler>
      <Music />

      <Layer>
        <Currency />
        <GameStatus />
        <Settings />
        <KillLog />
        <PlayerList />
      </Layer>

      <Layer>
        <Alerts />
      </Layer>
    </ErrorHandler>
  )
}
