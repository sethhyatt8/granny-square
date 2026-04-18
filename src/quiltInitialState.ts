import { loadPersisted } from './persistence'

const DEFAULT_ROWS = 8
const DEFAULT_COLS = 8

/** Read once at module load (browser only; `loadPersisted` guards localStorage). */
export const QUILT_INITIAL = (() => {
  const s = loadPersisted()
  if (!s) {
    return {
      rows: DEFAULT_ROWS,
      cols: DEFAULT_COLS,
      cells: Array(DEFAULT_ROWS * DEFAULT_COLS).fill(null) as (string | null)[],
      randomPool: [] as string[],
    }
  }
  return {
    rows: s.rows,
    cols: s.cols,
    cells: [...s.cells] as (string | null)[],
    randomPool: s.randomPool.slice(0, 5),
  }
})()
