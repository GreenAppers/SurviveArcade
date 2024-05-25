export function renderGlyphs(
  text: string,
  font: SpriteSheet,
  frame: Frame,
  options?: {
    existingGlyphsLength?: number
    positioned?: boolean
    textScaled?: boolean
  },
) {
  const glyphsAvailable = options?.existingGlyphsLength || text.size()
  const maxWidth = font.maxWidth
  const maxHeight = font.maxHeight
  for (let i = 0; i < glyphsAvailable; i++) {
    const character = text.sub(i + 1, i + 1)
    const glyph = font.glyphs[character] || font.glyphs[' ']
    const glyphFrame = frame.FindFirstChild<Sprite>(
      `Glyph${i < 10 ? '0' : ''}${i}`,
    )
    if (!glyph || !glyphFrame) continue
    const label = glyphFrame.ImageLabel
    label.ImageRectOffset = new Vector2(glyph.x, glyph.y)
    label.ImageRectSize = new Vector2(glyph.width, glyph.height)
    if (options?.textScaled) {
      label.Position = new UDim2(
        glyph.xoffset / maxWidth,
        0,
        glyph.yoffset / maxHeight,
        0,
      )
      label.Size = new UDim2(
        glyph.width / maxWidth,
        0,
        glyph.height / maxHeight,
        0,
      )
    } else if (options?.positioned !== false) {
      label.Position = new UDim2(glyph.xoffset, 0, glyph.yoffset, 0)
      label.Size = new UDim2(0, glyph.width, 0, glyph.height)
    }
  }
}
