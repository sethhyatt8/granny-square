import { useId } from 'react'

type Props = {
  color: string
  size?: number
  className?: string
}

/** Side-view cylindrical skein: wound tube with top/bottom rims and wrap lines. */
export function YarnSkeinIcon({ color, size = 44, className }: Props) {
  const gid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const gradSide = `skein-side-${gid}`
  const gradCap = `skein-cap-${gid}`

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradSide} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.75" />
          <stop offset="35%" stopColor={color} stopOpacity="1" />
          <stop offset="65%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.7" />
        </linearGradient>
        <radialGradient id={gradCap} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="55%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </radialGradient>
      </defs>

      {/* Bottom ellipse (back of cylinder) */}
      <ellipse cx="24" cy="34" rx="14" ry="6.5" fill={color} opacity="0.55" />

      {/* Cylinder side */}
      <path
        fill={`url(#${gradSide})`}
        d="M10 18 L10 32 C10 36.5 16.5 39 24 39 C31.5 39 38 36.5 38 32 L38 18 C38 13.5 31.5 11 24 11 C16.5 11 10 13.5 10 18 Z"
      />

      {/* Wrap ridges */}
      {[21, 25, 29].map((y) => (
        <path
          key={y}
          d={`M11 ${y} Q24 ${y + 0.8} 37 ${y}`}
          fill="none"
          stroke={color}
          strokeWidth="1.1"
          strokeOpacity="0.45"
        />
      ))}

      {/* Top face (cylinder cap) */}
      <ellipse cx="24" cy="18" rx="14" ry="6.5" fill={`url(#${gradCap})`} />
      <ellipse
        cx="24"
        cy="18"
        rx="14"
        ry="6.5"
        fill="none"
        stroke={color}
        strokeOpacity="0.35"
        strokeWidth="0.75"
      />

      {/* Highlight */}
      <ellipse cx="19" cy="17" rx="4" ry="2" fill="#fff" opacity="0.22" />
    </svg>
  )
}
