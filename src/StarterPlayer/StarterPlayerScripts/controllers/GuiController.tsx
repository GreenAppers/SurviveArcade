import { Controller, OnStart } from '@flamework/core'
import { createPortal, createRoot } from '@rbxts/react-roblox'
import Roact, { StrictMode } from '@rbxts/roact'
import { Players } from '@rbxts/services'
import { App } from 'StarterPlayer/StarterPlayerScripts/Gui/pages/App'

import { RootProvider } from '../Gui/providers/RootProvider'

@Controller({})
export class GuiController implements OnStart {
  private playerGui = Players.LocalPlayer.WaitForChild('PlayerGui')
  private root = createRoot(new Instance('Folder'))

  onStart() {
    this.root.render(
      createPortal(
        <StrictMode>
          <RootProvider key="root-provider">
            <App key="app" />
          </RootProvider>
        </StrictMode>,
        this.playerGui,
      ),
    )
  }
}
