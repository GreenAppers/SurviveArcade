# SurviveArcade [![build](https://github.com/GreenAppers/SurviveArcade/actions/workflows/build.yml/badge.svg)](https://github.com/GreenAppers/SurviveArcade/actions/workflows/build.yml)

![thumbnail](./assets/marketing/github_logo.jpg)

Join [the Experience (BETA)](https://www.roblox.com/games/15699266223)!

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

## Build `SurviveArcade.rbxlx`

```console
yarn && yarn build
```

## Studio

- Install [Hoarcekat](https://create.roblox.com/marketplace/asset/4621580428/Hoarcekat) plugin
- Install [rbxts-object-to-tree](https://www.roblox.com/library/3379119778/rbxts-object-to-tree) plugin
- Open `SurviveArcade.rbxlx` in Roblox Studio.
- Click Play to test.

## Workflow

- VSCode > NPM Scripts > Watch
- VSCode > Command+Shift+P > Rojo Menu > Start
- Studio > Plugins > Rojo > Connect to `rojo serve` running in VS Code.
- Develop scripts in VSCode
- Develop Models in Roblox Studio
- Drag `Level1` from `Replicated Storage > Arcade Tables` to `Workspace` when modeling. Drag back to play.

## Prepare Pull Request

### Automatic

- Save changes to `SurviveArcade.rbxlx`

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

## Deploy

```console
mantle deploy --environment beta
```

## Credits

- [roblox-ts](https://github.com/roblox-ts/roblox-ts)
- [Rojo](https://github.com/rojo-rbx/rojo) by [LPGhatguy](https://github.com/LPGhatguy)
- [Reflex](https://github.com/littensy/reflex) by [littensy](https://github.com/littensy)
- [Slither](https://github.com/littensy/slither) by [littensy](https://github.com/)
- [Roblox-TS-Template](https://github.com/MonzterDev/Roblox-TS-Template) by [MonzterDev](https://github.com/MonzterDev)
- [Gravity Controller](https://devforum.roblox.com/t/wall-stickgravity-controller/432598/404) by [Ego Moose](https://github.com/EgoMoose)
- [Skybox AI][https://skybox.blockadelabs.com/] by [Blockade Labs](https://www.blockadelabs.com/)
- Image and narrative generation by [Together AI](https://www.together.ai/) and [https://www.bing.com/images/create](Microsoft Designer)
- Roblox community for models, plugins, tutorials, and help!
