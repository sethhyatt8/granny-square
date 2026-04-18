import { useId, type ReactElement } from 'react'
import { adjustHex } from '../utils/color'

type Props = {
  color: string
  className?: string
}

const N = 9
const VB = 48
/** Larger gap → more “push out” at four-way junctions; smaller = tighter mesh. */
const GAP = 0.26

const CENTER_R = 4
const CENTER_C = 4

const isHoleCell = (r: number, c: number) => (r + c) % 2 === 0

const HOLE_EDGE_FR = 0.06
const YARN_STRAND_FR = 0.095

const DIVIDER_FR = 0.04
const DIVIDER_EXTRA = 0.35

/** Outer frame stroke = fraction of one cell width (drawn LAST so it stays visible). */
const OUTER_FRAME_FR = 0.33

/**
 * Slight emphasis on yarn tiles at grid corners only — never on hole tiles, or four
 * hole strokes meet and stack into one dark blob at each corner.
 */
const YARN_CORNER_BOOST = 0.35

const isCornerCell = (r: number, c: number) =>
  (r === 0 || r === N - 1) && (c === 0 || c === N - 1)

export function GrannySquareMotif({ color, className }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const centerRingMaskId = `gs-center-ring-${uid}`

  const cell = (VB - GAP * (N + 1)) / N
  const strand = adjustHex(color, 'black', 0.22)
  /** Lower rx = squarer tile corners (less rounding). */
  const rx = Math.min(cell * 0.22, cell * 0.36)

  const holeEdge = Math.max(0.45, cell * HOLE_EDGE_FR)
  const yarnStrand = Math.max(0.5, cell * YARN_STRAND_FR)
  const dividerW = Math.max(0.28, cell * DIVIDER_FR) + DIVIDER_EXTRA
  const dividerColor = adjustHex(color, 'black', 0.18)

  const rCenterHole = cell * 0.5

  const holes: ReactElement[] = []
  const yarns: ReactElement[] = []

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (r === CENTER_R && c === CENTER_C) continue

      const x = GAP + c * (cell + GAP)
      const y = GAP + r * (cell + GAP)
      const corner = isCornerCell(r, c)

      if (isHoleCell(r, c)) {
        /** Uniform stroke on holes — no extra at corners (prevents 4× overlap). */
        holes.push(
          <rect
            key={`h-${r}-${c}`}
            x={x}
            y={y}
            width={cell}
            height={cell}
            rx={rx}
            ry={rx}
            fill="var(--bg)"
            stroke={color}
            strokeWidth={holeEdge}
            paintOrder="stroke fill"
          />,
        )
      } else {
        const swYarn = yarnStrand + (corner ? YARN_CORNER_BOOST : 0)
        yarns.push(
          <rect
            key={`y-${r}-${c}`}
            x={x}
            y={y}
            width={cell}
            height={cell}
            rx={rx}
            ry={rx}
            fill={color}
            stroke={strand}
            strokeWidth={swYarn}
            paintOrder="stroke fill"
          />,
        )
      }
    }
  }

  const cx = GAP + CENTER_C * (cell + GAP) + cell / 2
  const cy = GAP + CENTER_R * (cell + GAP) + cell / 2
  const cx0 = GAP + CENTER_C * (cell + GAP)
  const cy0 = GAP + CENTER_R * (cell + GAP)

  const outerStrokeW = cell * OUTER_FRAME_FR
  const outerInset = outerStrokeW / 2 + 0.05
  /** Smaller outer rx — sharper big-corner frame, less “pill” shape. */
  const outerRx = Math.min(6, cell * 0.95)

  const dividers: ReactElement[] = []
  for (let k = 1; k < N; k++) {
    const xv = GAP + k * cell + (k - 0.5) * GAP
    const yh = GAP + k * cell + (k - 0.5) * GAP
    dividers.push(
      <line
        key={`v-${k}`}
        x1={xv}
        y1={GAP}
        x2={xv}
        y2={VB - GAP}
        stroke={dividerColor}
        strokeWidth={dividerW}
        strokeLinecap="butt"
        pointerEvents="none"
      />,
    )
    dividers.push(
      <line
        key={`h-${k}`}
        x1={GAP}
        y1={yh}
        x2={VB - GAP}
        y2={yh}
        stroke={dividerColor}
        strokeWidth={dividerW}
        strokeLinecap="butt"
        pointerEvents="none"
      />,
    )
  }

  return (
    <svg
      className={className}
      viewBox={`0 0 ${VB} ${VB}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      shapeRendering="geometricPrecision"
      aria-hidden
    >
      <defs>
        <mask
          id={centerRingMaskId}
          maskUnits="userSpaceOnUse"
          maskContentUnits="userSpaceOnUse"
        >
          <rect x={cx0} y={cy0} width={cell} height={cell} fill="white" rx={rx} ry={rx} />
          <circle cx={cx} cy={cy} r={rCenterHole} fill="black" />
        </mask>
      </defs>

      <g opacity={0.92}>{dividers}</g>

      {holes}
      {yarns}

      <g>
        <rect
          x={cx0}
          y={cy0}
          width={cell}
          height={cell}
          rx={rx}
          ry={rx}
          fill="var(--bg)"
          stroke={color}
          strokeWidth={holeEdge}
          paintOrder="stroke fill"
        />
        <rect
          x={cx0}
          y={cy0}
          width={cell}
          height={cell}
          fill={color}
          mask={`url(#${centerRingMaskId})`}
        />
        <circle cx={cx} cy={cy} r={rCenterHole} fill="var(--bg)" />
      </g>

      {/*
        Outer frame MUST render last — otherwise tiles paint on top and width changes are invisible.
        Yarn-colored stroke reads clearly against the mesh.
      */}
      <rect
        x={outerInset}
        y={outerInset}
        width={VB - 2 * outerInset}
        height={VB - 2 * outerInset}
        rx={outerRx}
        ry={outerRx}
        fill="none"
        stroke={color}
        strokeWidth={outerStrokeW}
        strokeLinejoin="round"
        pointerEvents="none"
      />
    </svg>
  )
}
