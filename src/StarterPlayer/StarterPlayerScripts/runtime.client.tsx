import { Flamework } from "@flamework/core";
import { createPortal, createRoot } from "@rbxts/react-roblox";
import Roact, { StrictMode } from "@rbxts/roact";
import { Players } from "@rbxts/services";
import { App } from "./UI/components/App";

// Flamework.addPaths("src/ReplicatedStorage/Components");
Flamework.ignite();

const root = createRoot(new Instance("Folder"));
const target = Players.LocalPlayer.WaitForChild("PlayerGui");

root.render(
  createPortal(
    <StrictMode>
      <App key="app" />
    </StrictMode>,
    target,
  ),
);
