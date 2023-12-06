# SurvivePinball

## Setup

First install [Roblox Studio](https://www.roblox.com/create), [Visual Studio Code](https://code.visualstudio.com/download), Git and clone this repo.

### Install Rojo

- Add [evaera.vscode-rojo](https://marketplace.visualstudio.com/items?itemName=evaera.vscode-rojo) extension to VSCode

- VSCode > Command+Shift+P `Rojo: Open Menu`

Use the menu to install Rojo and Roblox Studio Plugin. Then `Click to start live syncing`.

### Install Lune
 
```console
aftman add filiptibell/lune
lune --version
```

### Install roblox-ts on Node.js 18.17.0 with Node Version Manager:

```console
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
echo ". ~/.nvm/nvm.sh" >> ~/.zprofile
nvm install 18.17.0
nvm use 18.17.0
node --version
npm install --global yarn roblox-ts
```

## Build

```console
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

