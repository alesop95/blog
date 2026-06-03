interface EQGraphProps {
  /** Response curve as [frequencyHz, gainDb] points, e.g. [[20,0],[1000,-3]]. */
  curve: [number, number][]
  /** Optional caption under the graph. */
  caption?: string
}

const F_MIN = 20
const F_MAX = 20_000
const LOG_MIN = Math.log10(F_MIN)
const LOG_MAX = Math.log10(F_MAX)

const W = 640
const H = 280
const M = { l: 46, r: 16, t: 14, b: 30 }
const PW = W - M.l - M.r
const PH = H - M.t - M.b

const F_TICKS = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10_000, 20_000]
const fLabel = (f: number) =>
  f >= 1000 ? `${f / 1000}k` : `${f}`

function niceDb(curve: [number, number][]) {
  const maxAbs = Math.max(6, ...curve.map(([, db]) => Math.abs(db)))
  for (const step of [6, 12, 18, 24, 36, 48]) if (maxAbs <= step) return step
  return Math.ceil(maxAbs / 12) * 12
}

/**
 * Frequency-response curve (log frequency axis, linear dB axis) as a dark-mode-safe
 * SVG. For audio-engineering posts.
 *
 *   <EQGraph curve={[[20,0],[80,4],[1000,-3],[8000,6],[20000,-9]]} caption="…" />
 */
export function EQGraph({ curve, caption }: EQGraphProps) {
  const dbMax = niceDb(curve)
  const x = (f: number) =>
    M.l + ((Math.log10(f) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * PW
  const y = (db: number) => M.t + ((dbMax - db) / (2 * dbMax)) * PH

  const points = curve
    .slice()
    .sort((a, b) => a[0] - b[0])
    .map(([f, db]) => `${x(f).toFixed(1)},${y(db).toFixed(1)}`)
    .join(' ')

  const dbLines = [dbMax, dbMax / 2, 0, -dbMax / 2, -dbMax]

  return (
    <figure className="my-8">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto block w-full"
        role="img"
        aria-label={caption ?? 'Frequency response curve'}
      >
        {/* dB gridlines + labels */}
        {dbLines.map((db) => (
          <g key={db}>
            <line
              x1={M.l}
              x2={W - M.r}
              y1={y(db)}
              y2={y(db)}
              stroke="var(--color-ink)"
              strokeOpacity={db === 0 ? 0.35 : 0.1}
            />
            <text
              x={M.l - 6}
              y={y(db)}
              textAnchor="end"
              dominantBaseline="central"
              fontSize={10}
              fill="var(--color-ink)"
              fillOpacity={0.5}
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {db > 0 ? `+${db}` : db}
            </text>
          </g>
        ))}

        {/* Frequency gridlines + labels */}
        {F_TICKS.map((f) => (
          <g key={f}>
            <line
              x1={x(f)}
              x2={x(f)}
              y1={M.t}
              y2={H - M.b}
              stroke="var(--color-ink)"
              strokeOpacity={0.08}
            />
            <text
              x={x(f)}
              y={H - M.b + 14}
              textAnchor="middle"
              fontSize={10}
              fill="var(--color-ink)"
              fillOpacity={0.5}
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {fLabel(f)}
            </text>
          </g>
        ))}

        {/* The response curve */}
        <polyline
          points={points}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      {caption ? (
        <figcaption className="mt-2 text-center font-mono text-[0.72rem] uppercase tracking-[0.18em] text-ink/55">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
