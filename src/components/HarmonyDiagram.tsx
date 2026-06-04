interface HarmonyDiagramProps {
  /** Key/chord labels to highlight, e.g. ["C", "G", "Am"]. Matched verbatim. */
  highlight?: string[]
  /** Optional caption under the diagram. */
  caption?: string
}

// Circle of fifths, clockwise from the top: major ring (outer) + relative
// minor ring (inner). Index i sits at angle -90° + i·30°.
const MAJORS = ['C', 'G', 'D', 'A', 'E', 'B', 'Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F']
const MINORS = [
  'Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'Ebm', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm',
]

function polar(cx: number, cy: number, r: number, i: number) {
  const rad = ((-90 + i * 30) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

/**
 * The circle of fifths as a dark-mode-safe SVG (strokes/labels use the ink
 * colour token; highlighted keys use the accent). For harmony posts.
 *
 *   <HarmonyDiagram highlight={["C", "G", "Am"]} caption="I-V-vi in C" />
 */
export function HarmonyDiagram({ highlight = [], caption }: HarmonyDiagramProps) {
  const hi = new Set(highlight)
  const C = 160
  const rMaj = 128
  const rMin = 92

  const ring = (labels: string[], r: number, fontSize: number) =>
    labels.map((label, i) => {
      const { x, y } = polar(C, C, r, i)
      const on = hi.has(label)
      return (
        <g key={label}>
          <circle
            cx={x}
            cy={y}
            r={fontSize + 7}
            fill={on ? 'var(--color-accent)' : 'transparent'}
            stroke="var(--color-ink)"
            strokeOpacity={on ? 0 : 0.18}
          />
          <text
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={fontSize}
            fill={on ? 'var(--color-paper)' : 'var(--color-ink)'}
            fillOpacity={on ? 1 : 0.85}
            style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}
          >
            {label}
          </text>
        </g>
      )
    })

  return (
    <figure className="my-8">
      <svg
        viewBox="0 0 320 320"
        className="mx-auto block w-full max-w-[20rem]"
        role="img"
        aria-label={
          caption ?? `Circle of fifths${highlight.length ? `, highlighting ${highlight.join(', ')}` : ''}`
        }
      >
        <circle
          cx={C}
          cy={C}
          r={rMaj + 18}
          fill="none"
          stroke="var(--color-ink)"
          strokeOpacity={0.08}
        />
        <circle
          cx={C}
          cy={C}
          r={rMin - 18}
          fill="none"
          stroke="var(--color-ink)"
          strokeOpacity={0.08}
        />
        {ring(MAJORS, rMaj, 14)}
        {ring(MINORS, rMin, 11)}
      </svg>
      {caption ? (
        <figcaption className="mt-2 text-center font-mono text-[0.72rem] uppercase tracking-[0.18em] text-ink/70">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
