import { YARN_PALETTE } from './data/yarnPalette'

export const MIN_DIM = 1
export const MAX_DIM = 40
export const CLEAR_ID = '__clear__' as const

export function clampDim(raw: number): number {
  return Math.min(MAX_DIM, Math.max(MIN_DIM, Math.floor(raw) || MIN_DIM))
}

export function resizeCells(
  prev: (string | null)[],
  prevRows: number,
  prevCols: number,
  nextRows: number,
  nextCols: number,
): (string | null)[] {
  const next: (string | null)[] = Array(nextRows * nextCols).fill(null)
  const copyR = Math.min(prevRows, nextRows)
  const copyC = Math.min(prevCols, nextCols)
  for (let r = 0; r < copyR; r++) {
    for (let c = 0; c < copyC; c++) {
      next[r * nextCols + c] = prev[r * prevCols + c] ?? null
    }
  }
  return next
}

export function buildTallies(cells: (string | null)[]): Map<string, number> {
  const m = new Map<string, number>()
  for (const id of YARN_PALETTE.map((y) => y.id)) {
    m.set(id, 0)
  }
  let empty = 0
  for (const v of cells) {
    if (v == null || v === '') {
      empty++
      continue
    }
    m.set(v, (m.get(v) ?? 0) + 1)
  }
  m.set(CLEAR_ID, empty)
  return m
}
