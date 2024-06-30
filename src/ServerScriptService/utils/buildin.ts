import { TweenService } from '@rbxts/services'
import { findDescendentsWhichAre } from 'ReplicatedStorage/shared/utils/instance'

const BUILDING_ANIMATION_POSITION_OFFSET_AMOUNT = 5
const BUILDING_ANIMATION_PART_DELAY = 0.03
const random = new Random()

export function animateBuildingIn(buildingModel: Model, tweenInfo: TweenInfo) {
  // Collect BaseParts and original properties
  const parts = <BasePart[]>(
    findDescendentsWhichAre(buildingModel, 'BasePart').filter(
      (x) => x.Name !== 'Baseplate' && x.Name !== 'Ground',
    )
  )
  const originalProperties = parts.map((x) => ({
    Transparency: x.Transparency,
    CFrame: x.CFrame,
    Color: x.Color,
    Size: x.Size,
  }))

  // Make parts invisible and randomly move them
  parts.forEach((part) => {
    part.Transparency = 1
    part.Color = Color3.fromRGB(255, 255, 255)
    part.Size = new Vector3()
    const positionOffset = new Vector3(
      random.NextNumber(-1, 1),
      random.NextNumber(-0.25, 1.75),
      random.NextNumber(-1, 1),
    ).mul(BUILDING_ANIMATION_POSITION_OFFSET_AMOUNT)
    const rotationOffset = CFrame.Angles(
      random.NextNumber(-math.pi, math.pi),
      random.NextNumber(-math.pi, math.pi),
      random.NextNumber(-math.pi, math.pi),
    )
    part.CFrame = part.CFrame.mul(
      new CFrame(positionOffset).mul(rotationOffset),
    )
  })

  // Tween them back to their original state, one at a time
  let lastTween: Tween | undefined // Return this so the caller can do animateBuildingIn(...).Wait()
  parts.forEach((part, i) => {
    const tween = TweenService.Create(part, tweenInfo, originalProperties[i])
    lastTween = tween
    tween.Completed.Connect((_playbackState) => {
      // Sometimes Tweens stop before reaching their goal property.
      const original = originalProperties[i]
      part.Transparency = original.Transparency
      part.CFrame = original.CFrame
    })
    tween.Play()
    wait(BUILDING_ANIMATION_PART_DELAY)
  })
  return lastTween?.Completed
}
