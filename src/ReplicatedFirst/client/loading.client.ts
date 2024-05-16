const ContentProvider = game.GetService('ContentProvider')
const ReplicatedFirst = game.GetService('ReplicatedFirst')
const TweenService = game.GetService('TweenService')
const Players = game.GetService('Players')
const player = Players.LocalPlayer
const playerGui = player.WaitForChild('PlayerGui') as PlayerGui
const loadingGui = playerGui.WaitForChild('LoadingGui') as LoadingGui
const Background = loadingGui.Background

function resizeBar(percentage: number, time = 0.2) {
  Background.DisplayPercentage.Text = `${percentage}%`
  Background.AssetsLoaded.Text = `Loading Assets: 0/0`
  TweenService.Create(
    Background.BarBackground.Bar,
    new TweenInfo(time, Enum.EasingStyle.Sine, Enum.EasingDirection.Out),
    { Size: UDim2.fromScale(percentage / 100, 1) },
  ).Play()
}

function moveCamera(camera: Camera, cutscenes: Cutscenes, time = 10) {
  const loading1 = cutscenes.WaitForChild('Loading1') as Part
  const loading2 = cutscenes.WaitForChild('Loading2') as Part
  camera.CameraType = Enum.CameraType.Scriptable
  camera.CFrame = loading1.CFrame
  return TweenService.Create(
    camera,
    new TweenInfo(time, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
    { CFrame: loading2.CFrame },
  )
}

// Blur camera
const camera = game.Workspace.CurrentCamera
const blurEffect = camera ? new Instance('BlurEffect', camera) : undefined
if (blurEffect) blurEffect.Size = 24

// Stop default loading GUI
ReplicatedFirst.RemoveDefaultLoadingScreen()

// Show custom loading GUI
loadingGui.Enabled = true
resizeBar(10)

// Wait for player character to load
while (!player.Character) wait()
resizeBar(40)

// Start camera cutscene
const cutscenes = game.Workspace.WaitForChild('Cutscenes') as Cutscenes
const cutscene = camera ? moveCamera(camera, cutscenes, 10) : undefined
cutscene?.Play()

// Wait for assets to load
ContentProvider.PreloadAsync([game.Workspace])
resizeBar(100)
Background.AssetsLoaded.Text = 'Game loaded!'

// Fade out loading GUI
for (const v of loadingGui.GetDescendants()) {
  if (v.IsA('Frame'))
    TweenService.Create(v, new TweenInfo(0.5), {
      BackgroundTransparency: 1,
    }).Play()
  else if (v.IsA('TextLabel'))
    TweenService.Create(v, new TweenInfo(0.5), { TextTransparency: 1 }).Play()
}

// Fade out blur effect
while (blurEffect && blurEffect.Size > 0) {
  task.wait()
  blurEffect.Size = blurEffect.Size - 1
}

// Clean up
blurEffect?.Destroy()
cutscene?.Cancel()
if (camera) camera.CameraType = Enum.CameraType.Custom
loadingGui.Enabled = false

// Signal that we are done loading
cutscenes.LoadedServer.FireServer()
cutscenes.LoadedClient.Fire()
