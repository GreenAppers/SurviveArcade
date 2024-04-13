import { map } from 'ReplicatedStorage/shared/utils/math'

export const BASE_RESOLUTION = new Vector2(1920, 1020)
export const DEFAULT_REM = 16
export const MIN_REM = 8
export const MAX_ASPECT_RATIO = 19 / 9

export const fonts = {
  inter: {
    regular: new Font('rbxasset://fonts/families/LuckiestGuy.json'),
    medium: new Font(
      'rbxasset://fonts/families/LuckiestGuy.json',
      Enum.FontWeight.Medium,
    ),
    bold: new Font(
      'rbxasset://fonts/families/LuckiestGuy.json',
      Enum.FontWeight.Bold,
    ),
  },
  robotoMono: {
    regular: Font.fromEnum(Enum.Font.RobotoMono),
  },
}

export function calculateRem(
  viewport: Vector2,
  baseRem = DEFAULT_REM,
  minimumRem = MIN_REM,
  maximumRem = math.huge,
  remOverride?: number,
) {
  if (remOverride !== undefined) {
    return remOverride
  }

  // wide screens should not scale beyond iPhone aspect ratio
  const resolution = new Vector2(
    math.min(viewport.X, viewport.Y * MAX_ASPECT_RATIO),
    viewport.Y,
  )
  const scale = resolution.Magnitude / BASE_RESOLUTION.Magnitude
  const desktop = resolution.X > resolution.Y || scale >= 1

  // portrait mode should downscale slower than landscape
  const factor = desktop ? scale : map(scale, 0, 1, 0.25, 1)

  return math.clamp(math.round(baseRem * factor), minimumRem, maximumRem)
}
