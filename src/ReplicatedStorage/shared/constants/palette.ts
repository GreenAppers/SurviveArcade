export const accents = {
  red: Color3.fromRGB(208, 40, 41),
  pink: Color3.fromRGB(192, 112, 157),
  orange: Color3.fromRGB(216, 103, 50),
  yellow: Color3.fromRGB(248, 226, 159),
  sun: Color3.fromRGB(238, 180, 71),
  brown: Color3.fromRGB(141, 132, 71),
  green: Color3.fromRGB(85, 198, 85),
  sky: Color3.fromRGB(82, 198, 242),
  blue: Color3.fromRGB(85, 152, 207),
  indigo: Color3.fromRGB(19, 77, 151),
  purple: Color3.fromRGB(151, 19, 142),
} as const

export const neutrals = {
  text: Color3.fromRGB(234, 234, 234),
  base: Color3.fromRGB(30, 30, 46),
  eerie: Color3.fromRGB(17, 17, 27),
} as const

const base = {
  white: Color3.fromRGB(255, 255, 255),
  black: Color3.fromRGB(0, 0, 0),
}

export const palette = {
  ...accents,
  ...neutrals,
  ...base,
} as const

export const gameEmoticons = ['🏁', '🕹️', '🎮', '🎲']
