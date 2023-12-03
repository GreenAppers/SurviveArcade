# SurvivePinball

## Setup

- Add [evaera.vscode-rojo](https://marketplace.visualstudio.com/items?itemName=evaera.vscode-rojo) extension to VSCode

- VSCode > Command+Shift+P `Rojo: Open Menu`

Use the menu to install Rojo and Roblox Studio Plugin. Then `Click to start live syncing`.
 
```bash
aftman add filiptibell/lune
lune --version
```

## Build

```bash
rojo build -o "SurvivePinball.rbxlx"
```

## Studio

- Open `SurvivePinball.rbxlx` in Roblox Studio and click Play to test.
- Connect Rojo Studio Plugin to the `rojo serve` running in VS Code.

## Workflow

- Develop scripts in VS Code
- Develop Models in Studio
- Drag `Level1` from `Replicated Storage > Pinball Tables` to `Workspace` when modeling. Drag back to play.
- Save models to file-system as `.rbxmx` (Roblox Model XML) when done

