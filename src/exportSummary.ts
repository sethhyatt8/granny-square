import { YARN_BY_ID, YARN_PALETTE } from './data/yarnPalette'
import { CLEAR_ID } from './gridUtils'

/** Assumed finished size of one granny square (inches) for planning text. */
export const SQUARE_INCHES = 6

export function buildSummaryText(
  rows: number,
  cols: number,
  tallies: Map<string, number>,
): string {
  const total = rows * cols
  const empty = tallies.get(CLEAR_ID) ?? 0
  const widthIn = cols * SQUARE_INCHES
  const heightIn = rows * SQUARE_INCHES
  const lines: string[] = [
    `Granny square quilt — ${rows} × ${cols} (${total} squares)`,
    `Approx. overall size (each square ${SQUARE_INCHES}" × ${SQUARE_INCHES}"): ~${widthIn}" wide × ~${heightIn}" tall (~${widthIn * 2.54} cm × ~${heightIn * 2.54} cm)`,
    `Empty: ${empty}`,
    '',
    'Squares by color:',
  ]
  for (const y of YARN_PALETTE) {
    const n = tallies.get(y.id) ?? 0
    const brand = y.brand === 'mainstays' ? 'Mainstays' : 'Red Heart'
    lines.push(`- ${y.label} (${brand}): ${n}`)
  }
  return lines.join('\n')
}

export function buildDesignJson(
  rows: number,
  cols: number,
  cells: (string | null)[],
  randomPool: string[],
  tallies: Map<string, number>,
): string {
  const byColor: Record<string, { label: string; count: number }> = {}
  for (const y of YARN_PALETTE) {
    byColor[y.id] = { label: y.label, count: tallies.get(y.id) ?? 0 }
  }
  const widthIn = cols * SQUARE_INCHES
  const heightIn = rows * SQUARE_INCHES

  return JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      planning: {
        inchesPerSquare: SQUARE_INCHES,
        approximateOverallInches: { width: widthIn, height: heightIn },
        approximateOverallCm: {
          width: Math.round(widthIn * 2.54 * 10) / 10,
          height: Math.round(heightIn * 2.54 * 10) / 10,
        },
      },
      rows,
      cols,
      cells: cells.map((id) =>
        id == null ? null : { id, label: YARN_BY_ID[id]?.label ?? id },
      ),
      randomPool,
      emptySquares: tallies.get(CLEAR_ID) ?? 0,
      squaresByColor: byColor,
    },
    null,
    2,
  )
}
