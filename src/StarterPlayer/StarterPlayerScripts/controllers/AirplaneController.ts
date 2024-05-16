import { Controller, OnStart } from '@flamework/core'
import { Players, RunService, UserInputService } from '@rbxts/services'

@Controller({})
export class AirplaneController implements OnStart {
  plane: Airplane | undefined
  camera: Camera | undefined
  cameraType: Enum.CameraType | undefined
  config: AirplaneConfig | undefined
  bodyGyro: BodyGyro | undefined
  bodyVelocity: BodyVelocity | undefined
  mobileGui: AirplaneMobileGui | undefined

  sliding = false
  speed = 0

  startPlane(plane: Airplane, config: AirplaneConfig) {
    if (this.plane !== undefined) return

    this.camera = game.Workspace.CurrentCamera
    if (!this.camera) return

    this.plane = plane
    this.config = config
    this.cameraType = this.camera.CameraType
    this.camera.CameraType = Enum.CameraType.Scriptable
    this.bodyGyro = new Instance('BodyGyro', plane.Body)
    this.bodyGyro.D = 30
    this.bodyGyro.P = 300
    this.bodyGyro.MaxTorque = new Vector3()
    this.bodyVelocity = new Instance('BodyVelocity', plane.Body)
    this.bodyVelocity.P = math.huge
    this.bodyVelocity.MaxForce = new Vector3()

    plane.AimPart.AirplaneGui.Enabled = true
    this.sliding = false
    this.speed = 0

    const playerGui = Players.LocalPlayer?.WaitForChild('PlayerGui')
    if (UserInputService.TouchEnabled && playerGui) {
      UserInputService.ModalEnabled = true
      this.mobileGui = plane.AimPart.AirplaneMobileGui.Clone()
      this.mobileGui.Parent = playerGui

      const throttle = this.mobileGui.Throttle
      throttle.Slider.MouseButton1Down.Connect(() => {
        this.sliding = true
        const mu = UserInputService.TouchEnded.Connect(() => {
          this.sliding = false
          mu.Disconnect()
        })
        const mouse = Players.LocalPlayer.GetMouse()
        while (this.sliding) {
          RunService.RenderStepped.Wait()
          const mouseY = mouse.Y - throttle.AbsolutePosition.Y
          const s = math.min(math.max(mouseY / throttle.AbsoluteSize.Y, 0), 1)
          this.speed = (1 - s) * config.speed
          throttle.Slider.Position = new UDim2(0, -10, s, -35)
        }
      })
    }
  }

  stopPlane(plane: Airplane) {
    if (this.plane !== plane) return

    this.bodyGyro?.Destroy()
    this.bodyVelocity?.Destroy()
    this.mobileGui?.Destroy()

    plane.AimPart.AirplaneGui.Enabled = false

    if (this.camera && this.cameraType) this.camera.CameraType = this.cameraType
    if (UserInputService.TouchEnabled) UserInputService.ModalEnabled = false

    this.mobileGui = undefined
    this.bodyVelocity = undefined
    this.bodyGyro = undefined
    this.cameraType = undefined
    this.camera = undefined
    this.plane = undefined
  }

  onStart() {
    let x = 0
    let y = 0
    let thumb1 = new Vector2()
    let thumb2 = new Vector2()

    UserInputService.InputBegan.Connect((inputObject, processed) => {
      if (this.plane && !processed) {
        if (inputObject.UserInputType === Enum.UserInputType.MouseButton1)
          this.plane.Shoot.FireServer()
      }
    })

    if (UserInputService.TouchEnabled) {
      UserInputService.InputChanged.Connect((inputObject) => {
        if (!this.plane || !this.config) return
        if (inputObject.KeyCode === Enum.KeyCode.Thumbstick1) {
          thumb1 = new Vector2(0, inputObject.Position.Y)
          if (math.abs(thumb1.Y) <= 0.1) thumb1 = new Vector2(thumb1.X, 0)
          this.speed = math.max(thumb1.Y, 0) * this.config.speed
        } else if (inputObject.KeyCode === Enum.KeyCode.Thumbstick2) {
          thumb2 = new Vector2(inputObject.Position.X, inputObject.Position.Y)
          if (math.abs(thumb2.X) <= 0.1) thumb2 = new Vector2(0, thumb2.Y)
          if (math.abs(thumb2.Y) <= 0.1) thumb2 = new Vector2(thumb2.X, 0)
        }
      })
    }

    for (;;) {
      const plane = this.plane
      const camera = this.camera
      const config = this.config
      const bodyVelocity = this.bodyVelocity
      const bodyGyro = this.bodyGyro
      const mouse = Players.LocalPlayer.GetMouse()
      if (!plane || !camera || !config || !bodyVelocity || !bodyGyro) {
        task.wait(1)
        continue
      }

      const body = plane.Body
      const [deltaTime] = RunService.RenderStepped.Wait()

      let mouseX = -thumb2.X
      let mouseY = -thumb2.Y
      if (thumb2.Magnitude <= 0 && !this.sliding) {
        mouseX =
          (camera.ViewportSize.X / 2 - mouse.X) / (camera.ViewportSize.X / 2)
        mouseY =
          (camera.ViewportSize.Y / 2 - mouse.Y) / (camera.ViewportSize.Y / 2)
      }

      y = mouseY * 1.4
      x = (x + (mouseX / 50) * (config.turnSpeed / 10)) % (math.pi * 2)

      if (UserInputService.IsKeyDown(Enum.KeyCode.W)) {
        this.speed = math.min(this.speed + deltaTime * 100, config.speed)
      } else if (UserInputService.IsKeyDown(Enum.KeyCode.S)) {
        this.speed = math.max(this.speed - deltaTime * 100, 0)
      }

      const power = this.speed / config.speed

      camera.CoordinateFrame = camera.CoordinateFrame.Lerp(
        new CFrame(body.Position)
          .mul(CFrame.Angles(0, x, 0))
          .mul(CFrame.Angles(y, 0, 0))
          .mul(new CFrame(0, 10, 30)),
        deltaTime * 15,
      )

      bodyGyro.CFrame = camera.CoordinateFrame.mul(CFrame.Angles(0, 0, mouseX))
      bodyGyro.MaxTorque = new Vector3(power, power, power).mul(
        config.turnSpeed,
      )
      bodyVelocity.Velocity = body.CFrame.LookVector.mul(config.speed)
      bodyVelocity.MaxForce = new Vector3(1000000, 1000000, 1000000).mul(power)

      if (config.gunsEnabled)
        plane.AimPart.CFrame = body.CFrame.mul(new CFrame(0, 8, -100))
    }
  }
}
