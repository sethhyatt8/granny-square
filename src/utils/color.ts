/** Parse #RGB or #RRGGBB */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '')
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h
  const n = Number.parseInt(full, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

export function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) =>
    Math.min(255, Math.max(0, Math.round(n)))
      .toString(16)
      .padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

/** Move toward white (t=1) or black (t=-1) by amount 0–1 */
export function adjustHex(hex: string, toward: 'white' | 'black', amount: number): string {
  const { r, g, b } = hexToRgb(hex)
  const t = Math.min(1, Math.max(0, amount))
  if (toward === 'white') {
    return rgbToHex(
      r + (255 - r) * t,
      g + (255 - g) * t,
      b + (255 - b) * t,
    )
  }
  return rgbToHex(r * (1 - t), g * (1 - t), b * (1 - t))
}
