import { Controller, OnStart } from '@flamework/core'
import React, { StrictMode } from '@rbxts/react'
import { createPortal, createRoot } from '@rbxts/react-roblox'
import { Players } from '@rbxts/services'
import { App } from 'StarterPlayer/StarterPlayerScripts/Gui/pages/App'
import { RootProvider } from 'StarterPlayer/StarterPlayerScripts/Gui/providers/RootProvider'

@Controller({})
export class GuiController implements OnStart {
  private playerGui = Players.LocalPlayer.WaitForChild('PlayerGui')
  private root = createRoot(new Instance('Folder'))

  onStart() {
    this.root.render(
      createPortal(
        <StrictMode>
          <RootProvider>
            <App />
          </RootProvider>
        </StrictMode>,
        this.playerGui,
      ),
    )
  }
}
