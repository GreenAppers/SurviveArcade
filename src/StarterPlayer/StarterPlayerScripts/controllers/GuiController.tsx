import { Controller, OnStart } from "@flamework/core"
import { Players } from "@rbxts/services"
import { createPortal, createRoot } from "@rbxts/react-roblox"
import Roact, { StrictMode } from "@rbxts/roact"
import { App } from "../Gui/components/App"

@Controller({})
export class GuiController implements OnStart {
  private playerGui = Players.LocalPlayer.WaitForChild("PlayerGui")
  private root = createRoot(new Instance("Folder"))

  onStart() {
    this.root.render(
      createPortal(
        <StrictMode>
          <App key="app" />
        </StrictMode>,
        this.playerGui,
      ),
    )
  }
}