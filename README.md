# SurvivePinball

## Setup

Install [Roblox Studio](https://www.roblox.com/create), [Visual Studio Code](https://code.visualstudio.com/download), Git and git clone this repo.

### Install VSCode Extensions

- [Rojo](https://marketplace.visualstudio.com/items?itemName=evaera.vscode-rojo)
- [Rojo UI](https://marketplace.visualstudio.com/items?itemName=muoshuu.rojo-ui)
- [Rojo Explorer](https://marketplace.visualstudio.com/items?itemName=Meqolo.rojo-explorer)
- [Selene](https://marketplace.visualstudio.com/items?itemName=Kampfkarren.selene-vscode)
- [StyLua](https://marketplace.visualstudio.com/items?itemName=JohnnyMorganz.stylua)
- [Roblox LSP](https://marketplace.visualstudio.com/items?itemName=Nightrains.robloxlsp)
- [Roblox TS](https://marketplace.visualstudio.com/items?itemName=Roblox-TS.vscode-roblox-ts)

### Install Rojo

- VSCode > Command+Shift+P `Rojo: Open Menu`

Use the menu to install Rojo and Roblox Studio Plugin. Then `Click to start live syncing`.

### Install Lune
 
```console
aftman install
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

## Build `SurvivePinball.rbxlx`

```console
yarn && yarn build
```

## Studio

- Install plugin https://www.roblox.com/library/3379119778/rbxts-object-to-tree
- Open `SurvivePinball.rbxlx` in Roblox Studio.
- Click Play to test.

## Workflow

- VSCode > NPM Scripts > Watch
- VSCode > Command+Shift+P > Rojo Menu > Start
- Studio > Plugins > Rojo > Connect to `rojo serve` running in VS Code.
- Develop scripts in VSCode
- Develop Models in Roblox Studio
- Drag `Level1` from `Replicated Storage > Pinball Tables` to `Workspace` when modeling. Drag back to play.

## Prepare Pull Request

### Automatic

- Save changes to `SurvivePinball.rbxlx`

```console
yarn syncback
```

### Manual

- Save updated models to file-system as `.rbxmx` (Roblox Model XML)

## Pull Request

```console
git checkout -b my-new-updates
git commit -am "Updated game"
git push origin my-new-updates
```
