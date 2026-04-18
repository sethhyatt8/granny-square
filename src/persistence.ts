export const STORAGE_KEY = 'granny-quilt-design-v1'

export type PersistedQuilt = {
  v: 1
  rows: number
  cols: number
  cells: (string | null)[]
  /** Up to 5 yarn ids used for random fill */
  randomPool: string[]
  updatedAt: string
}

export function loadPersisted(): PersistedQuilt | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as PersistedQuilt
    if (p.v !== 1 || !Array.isArray(p.cells)) return null
    const len = p.rows * p.cols
    if (p.cells.length !== len) return null
    if (!Array.isArray(p.randomPool)) p.randomPool = []
    return p
  } catch {
    return null
  }
}

export function savePersisted(p: Omit<PersistedQuilt, 'updatedAt'>): void {
  if (typeof localStorage === 'undefined') return
  const payload: PersistedQuilt = {
    ...p,
    updatedAt: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}
