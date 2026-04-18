import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import { GrannySquareMotif } from './components/GrannySquareMotif'
import {
  YARN_BY_ID,
  YARN_PALETTE,
  type YarnBrand,
  type YarnColor,
} from './data/yarnPalette'
import { buildDesignJson, buildSummaryText } from './exportSummary'
import {
  buildTallies,
  clampDim,
  MAX_DIM,
  MIN_DIM,
  resizeCells,
} from './gridUtils'
import { savePersisted } from './persistence'
import { QUILT_INITIAL } from './quiltInitialState'
import './App.css'

const MAX_RANDOM_COLORS = 5

function groupByBrand(colors: YarnColor[]): Record<YarnBrand, YarnColor[]> {
  return {
    mainstays: colors.filter((c) => c.brand === 'mainstays'),
    'red-heart': colors.filter((c) => c.brand === 'red-heart'),
  }
}

function downloadTextFile(filename: string, text: string, mime: string) {
  const blob = new Blob([text], { type: mime })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

export default function App() {
  const [rows, setRows] = useState(QUILT_INITIAL.rows)
  const [cols, setCols] = useState(QUILT_INITIAL.cols)
  const [cells, setCells] = useState<(string | null)[]>(QUILT_INITIAL.cells)
  const [randomPool, setRandomPool] = useState<string[]>(QUILT_INITIAL.randomPool)
  const [activeYarnId, setActiveYarnId] = useState<string>(YARN_PALETTE[0].id)
  const [copyHint, setCopyHint] = useState<string | null>(null)

  const tallies = useMemo(() => buildTallies(cells), [cells])
  const byBrand = useMemo(() => groupByBrand(YARN_PALETTE), [])

  useEffect(() => {
    const t = window.setTimeout(() => {
      savePersisted({
        v: 1,
        rows,
        cols,
        cells,
        randomPool: randomPool
          .filter((id) => YARN_BY_ID[id])
          .slice(0, MAX_RANDOM_COLORS),
      })
    }, 400)
    return () => window.clearTimeout(t)
  }, [rows, cols, cells, randomPool])

  const updateRows = useCallback(
    (raw: number) => {
      const nextRows = clampDim(raw)
      setCells((prev) => resizeCells(prev, rows, cols, nextRows, cols))
      setRows(nextRows)
    },
    [rows, cols],
  )

  const updateCols = useCallback(
    (raw: number) => {
      const nextCols = clampDim(raw)
      setCells((prev) => resizeCells(prev, rows, cols, rows, nextCols))
      setCols(nextCols)
    },
    [rows, cols],
  )

  const onCellClick = useCallback(
    (index: number) => {
      setCells((prev) => {
        const next = [...prev]
        next[index] = activeYarnId
        return next
      })
    },
    [activeYarnId],
  )

  const onCellClear = useCallback((index: number) => {
    setCells((prev) => {
      const next = [...prev]
      next[index] = null
      return next
    })
  }, [])

  const toggleRandomColor = useCallback((id: string) => {
    setRandomPool((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= MAX_RANDOM_COLORS) return prev
      return [...prev, id]
    })
  }, [])

  const fillRandom = useCallback(() => {
    if (randomPool.length === 0) return
    setCells((prev) =>
      prev.map(() => {
        const i = Math.floor(Math.random() * randomPool.length)
        return randomPool[i] ?? null
      }),
    )
  }, [randomPool])

  const clearGrid = useCallback(() => {
    setCells((prev) => prev.map(() => null))
  }, [])

  const copySummary = useCallback(async () => {
    const text = buildSummaryText(rows, cols, tallies)
    try {
      await navigator.clipboard.writeText(text)
      setCopyHint('Summary copied')
    } catch {
      setCopyHint('Copy blocked — try Download instead')
    }
    window.setTimeout(() => setCopyHint(null), 2500)
  }, [rows, cols, tallies])

  const downloadDesign = useCallback(() => {
    const json = buildDesignJson(rows, cols, cells, randomPool, tallies)
    const stamp = new Date().toISOString().slice(0, 10)
    downloadTextFile(`granny-quilt-${rows}x${cols}-${stamp}.json`, json, 'application/json')
  }, [rows, cols, cells, randomPool, tallies])

  const downloadSummary = useCallback(() => {
    const text = buildSummaryText(rows, cols, tallies)
    const stamp = new Date().toISOString().slice(0, 10)
    downloadTextFile(`granny-quilt-summary-${stamp}.txt`, text, 'text/plain;charset=utf-8')
  }, [rows, cols, tallies])

  const previewColor = YARN_BY_ID[activeYarnId]?.hex ?? YARN_PALETTE[0].hex

  return (
    <div className="quilt-app">
      <header className="quilt-page-header">
        <div className="quilt-page-header-row">
          <div className="quilt-motif-preview" aria-hidden>
            <GrannySquareMotif color={previewColor} />
          </div>
          <div>
            <h1 className="quilt-title">Granny Square Designer</h1>
            <p className="quilt-lede">
              Set the grid, pick a color, and tap squares to paint. Right-click a square to clear
              it. Each square uses a 9×9 mesh motif. Your design auto-saves in this browser.
            </p>
          </div>
        </div>
      </header>

      <div className="quilt-workspace">
        <aside className="quilt-sidebar" aria-label="Tools and yarn">
          <section className="quilt-controls" aria-label="Grid size">
            <div className="quilt-field">
              <span className="quilt-field-label" id="label-rows">
                Rows
              </span>
              <div className="quilt-stepper" role="group" aria-labelledby="label-rows">
                <button
                  type="button"
                  className="quilt-step-btn"
                  onClick={() => updateRows(rows - 1)}
                  disabled={rows <= MIN_DIM}
                  aria-label="Decrease rows"
                >
                  −
                </button>
                <input
                  type="number"
                  min={MIN_DIM}
                  max={MAX_DIM}
                  value={rows}
                  onChange={(e) => updateRows(Number(e.target.value))}
                  aria-valuemin={MIN_DIM}
                  aria-valuemax={MAX_DIM}
                />
                <button
                  type="button"
                  className="quilt-step-btn"
                  onClick={() => updateRows(rows + 1)}
                  disabled={rows >= MAX_DIM}
                  aria-label="Increase rows"
                >
                  +
                </button>
              </div>
            </div>
            <div className="quilt-field">
              <span className="quilt-field-label" id="label-cols">
                Columns
              </span>
              <div className="quilt-stepper" role="group" aria-labelledby="label-cols">
                <button
                  type="button"
                  className="quilt-step-btn"
                  onClick={() => updateCols(cols - 1)}
                  disabled={cols <= MIN_DIM}
                  aria-label="Decrease columns"
                >
                  −
                </button>
                <input
                  type="number"
                  min={MIN_DIM}
                  max={MAX_DIM}
                  value={cols}
                  onChange={(e) => updateCols(Number(e.target.value))}
                />
                <button
                  type="button"
                  className="quilt-step-btn"
                  onClick={() => updateCols(cols + 1)}
                  disabled={cols >= MAX_DIM}
                  aria-label="Increase columns"
                >
                  +
                </button>
              </div>
            </div>
          </section>

          <section className="quilt-palette-section" aria-labelledby="paint-heading">
            <h2 id="paint-heading" className="quilt-h2">
              Paint with
            </h2>
            <div className="quilt-brand-group">
              <h3 className="quilt-h3">Mainstays</h3>
              <ul className="quilt-paint-list">
                {byBrand.mainstays.map((y) => (
                  <li key={y.id}>
                    <button
                      type="button"
                      className={`quilt-paint-chip ${activeYarnId === y.id ? 'is-active' : ''}`}
                      onClick={() => setActiveYarnId(y.id)}
                      aria-pressed={activeYarnId === y.id}
                    >
                      <span
                        className="quilt-paint-swatch"
                        style={{ backgroundColor: y.hex }}
                        aria-hidden
                      />
                      <span className="quilt-paint-name">{y.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="quilt-brand-group">
              <h3 className="quilt-h3">Red Heart</h3>
              <ul className="quilt-paint-list">
                {byBrand['red-heart'].map((y) => (
                  <li key={y.id}>
                    <button
                      type="button"
                      className={`quilt-paint-chip ${activeYarnId === y.id ? 'is-active' : ''}`}
                      onClick={() => setActiveYarnId(y.id)}
                      aria-pressed={activeYarnId === y.id}
                    >
                      <span
                        className="quilt-paint-swatch"
                        style={{ backgroundColor: y.hex }}
                        aria-hidden
                      />
                      <span className="quilt-paint-name">{y.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </aside>

        <div className="quilt-main">
          <p className="quilt-grid-hint">
            Click a square to paint with the selected color. Right-click to clear.
          </p>
          <section
            className="quilt-grid-section"
            aria-label="Quilt grid — right-click a square to clear"
          >
            <div
              className="quilt-grid"
              style={
                {
                  ['--qc' as string]: String(cols),
                  ['--qr' as string]: String(rows),
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                  aspectRatio: `${cols} / ${rows}`,
                } as CSSProperties
              }
            >
              {cells.map((yarnId, i) => (
                <button
                  key={i}
                  type="button"
                  className={`quilt-cell ${yarnId ? 'has-yarn' : 'is-empty'}`}
                  onClick={() => onCellClick(i)}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    onCellClear(i)
                  }}
                  aria-label={
                    yarnId
                      ? `Square ${Math.floor(i / cols) + 1},${(i % cols) + 1}: ${YARN_BY_ID[yarnId]?.label ?? 'color'}`
                      : `Square ${Math.floor(i / cols) + 1},${(i % cols) + 1}: empty`
                  }
                >
                  {yarnId ? (
                    <GrannySquareMotif color={YARN_BY_ID[yarnId]?.hex ?? '#888'} />
                  ) : null}
                </button>
              ))}
            </div>
          </section>

          <div className="quilt-below-grid">
            <section className="quilt-random" aria-labelledby="random-heading">
              <h2 id="random-heading" className="quilt-h2">
                Random mosaic
              </h2>
              <p className="quilt-random-help">
                Choose up to {MAX_RANDOM_COLORS} colors, then fill the grid at random with only those
                yarns.
              </p>
              <div className="quilt-random-picks" role="group" aria-label="Colors for random fill">
                {YARN_PALETTE.map((y) => {
                  const checked = randomPool.includes(y.id)
                  const atCap = !checked && randomPool.length >= MAX_RANDOM_COLORS
                  return (
                    <label key={y.id} className={`quilt-random-chip ${atCap ? 'is-disabled' : ''}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={atCap}
                        onChange={() => toggleRandomColor(y.id)}
                      />
                      <span
                        className="quilt-random-swatch"
                        style={{ backgroundColor: y.hex }}
                        aria-hidden
                      />
                      <span className="quilt-random-label">{y.label}</span>
                    </label>
                  )
                })}
              </div>
              <p className="quilt-random-count">
                Selected: {randomPool.length}/{MAX_RANDOM_COLORS}
              </p>
              <div className="quilt-random-actions">
                <button
                  type="button"
                  className="quilt-btn-primary"
                  onClick={fillRandom}
                  disabled={randomPool.length === 0}
                >
                  Fill grid randomly
                </button>
                <button type="button" className="quilt-btn-ghost" onClick={clearGrid}>
                  Clear entire grid
                </button>
              </div>
            </section>

            <section className="quilt-save" aria-labelledby="save-heading">
              <h2 id="save-heading" className="quilt-h2">
                Save & export
              </h2>
              <p className="quilt-save-note">
                This browser keeps your last layout automatically. You can also copy a text summary or
                download JSON with the full grid and counts.
              </p>
              <div className="quilt-save-actions">
                <button type="button" className="quilt-btn-primary" onClick={copySummary}>
                  Copy summary
                </button>
                <button type="button" className="quilt-btn-secondary" onClick={downloadSummary}>
                  Download summary (.txt)
                </button>
                <button type="button" className="quilt-btn-secondary" onClick={downloadDesign}>
                  Download design (.json)
                </button>
              </div>
              {copyHint ? <p className="quilt-copy-hint">{copyHint}</p> : null}
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
