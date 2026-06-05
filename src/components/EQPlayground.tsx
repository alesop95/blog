'use client'

import { Pause, Play } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { audioSupported, getAudioContext } from '@/lib/audio'

interface EQPlaygroundProps {
  /** Optional caption under the playground. */
  caption?: string
}

const F_MIN = 20
const F_MAX = 20_000
const LOG_MIN = Math.log10(F_MIN)
const LOG_MAX = Math.log10(F_MAX)
const N = 96 // response-curve sample count
const DB_RANGE = 18 // plot ±18 dB

const W = 640
const H = 220
const M = { l: 40, r: 12, t: 12, b: 26 }
const PW = W - M.l - M.r
const PH = H - M.t - M.b

const TYPES: { value: BiquadFilterType; label: string }[] = [
  { value: 'peaking', label: 'Peaking' },
  { value: 'lowpass', label: 'Low-pass' },
  { value: 'highpass', label: 'High-pass' },
  { value: 'lowshelf', label: 'Low shelf' },
  { value: 'highshelf', label: 'High shelf' },
]

const xForFreq = (f: number) =>
  M.l + ((Math.log10(f) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * PW
const yForDb = (db: number) => M.t + ((DB_RANGE - db) / (2 * DB_RANGE)) * PH

// Log-spaced frequencies for getFrequencyResponse (stable across renders).
const FREQS = (() => {
  const a = new Float32Array(N)
  for (let i = 0; i < N; i++) {
    a[i] = 10 ** (LOG_MIN + (i / (N - 1)) * (LOG_MAX - LOG_MIN))
  }
  return a
})()

/** Paul Kellet pink-noise fill - enough to *hear* the filter on broadband noise. */
function fillPink(buffer: AudioBuffer) {
  const data = buffer.getChannelData(0)
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1
    b0 = 0.99886 * b0 + white * 0.0555179
    b1 = 0.99332 * b1 + white * 0.0750759
    b2 = 0.969 * b2 + white * 0.153852
    b3 = 0.8665 * b3 + white * 0.3104856
    b4 = 0.55 * b4 + white * 0.5329522
    b5 = -0.7616 * b5 - white * 0.016898
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
    b6 = white * 0.115926
  }
}

/**
 * Interactive EQ playground: pink noise through a single biquad filter you can
 * shape live, with the filter's real frequency response drawn from
 * `getFrequencyResponse`. Audio starts on the play button (user gesture);
 * controls work even while silent (the curve still updates). For audio posts.
 */
export function EQPlayground({ caption }: EQPlaygroundProps) {
  const [type, setType] = useState<BiquadFilterType>('peaking')
  const [freq, setFreq] = useState(1000)
  const [q, setQ] = useState(1)
  const [gain, setGain] = useState(6)
  const [playing, setPlaying] = useState(false)
  const [path, setPath] = useState('')
  const supported = useRef(audioSupported())

  const filterRef = useRef<BiquadFilterNode | null>(null)
  const bufferRef = useRef<AudioBuffer | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)

  // Lazily ensure the (suspended) context + filter exist. getFrequencyResponse
  // works while suspended, so the curve renders before any sound is requested.
  const ensureNodes = useCallback((): BiquadFilterNode | null => {
    if (filterRef.current) return filterRef.current
    const ctx = getAudioContext()
    if (!ctx) return null
    const filter = ctx.createBiquadFilter()
    filterRef.current = filter
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    fillPink(buffer)
    bufferRef.current = buffer
    return filter
  }, [])

  // Apply params to the filter and redraw the response curve.
  const refresh = useCallback(() => {
    const filter = ensureNodes()
    if (!filter) return
    const ctx = getAudioContext()
    const now = ctx ? ctx.currentTime : 0
    filter.type = type
    filter.frequency.setValueAtTime(freq, now)
    filter.Q.setValueAtTime(q, now)
    filter.gain.setValueAtTime(gain, now)

    const mag = new Float32Array(N)
    const phase = new Float32Array(N)
    filter.getFrequencyResponse(FREQS, mag, phase)
    let d = ''
    for (let i = 0; i < N; i++) {
      const db = 20 * Math.log10(mag[i] || 1e-6)
      const clamped = Math.max(-DB_RANGE, Math.min(DB_RANGE, db))
      d += `${i === 0 ? 'M' : 'L'}${xForFreq(FREQS[i] ?? F_MIN).toFixed(1)},${yForDb(clamped).toFixed(1)} `
    }
    setPath(d.trim())
  }, [type, freq, q, gain, ensureNodes])

  useEffect(() => {
    if (supported.current) refresh()
  }, [refresh])

  // Tear down audio on unmount.
  useEffect(
    () => () => {
      sourceRef.current?.stop()
      sourceRef.current?.disconnect()
      filterRef.current?.disconnect()
    },
    [],
  )

  const toggle = useCallback(async () => {
    const ctx = getAudioContext()
    const filter = ensureNodes()
    if (!ctx || !filter || !bufferRef.current) return
    if (playing) {
      sourceRef.current?.stop()
      sourceRef.current = null
      setPlaying(false)
      return
    }
    await ctx.resume()
    const source = ctx.createBufferSource()
    source.buffer = bufferRef.current
    source.loop = true
    source.connect(filter)
    filter.connect(ctx.destination)
    source.start()
    sourceRef.current = source
    setPlaying(true)
  }, [playing, ensureNodes])

  if (!supported.current) {
    return (
      <figure className="my-8">
        <p className="rounded-md border border-ink/15 bg-ink/[0.02] px-4 py-6 text-center font-mono text-[0.8rem] text-ink/70">
          Audio isn't available in this browser.
        </p>
      </figure>
    )
  }

  const gridDb = [DB_RANGE, DB_RANGE / 2, 0, -DB_RANGE / 2, -DB_RANGE]
  const gridF = [100, 1000, 10_000]

  return (
    <figure className="my-8 print:hidden">
      <div className="rounded-md border border-ink/12 bg-ink/[0.02] p-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block w-full"
          role="img"
          aria-label="Filter frequency response"
        >
          {gridDb.map((db) => (
            <line
              key={db}
              x1={M.l}
              x2={W - M.r}
              y1={yForDb(db)}
              y2={yForDb(db)}
              stroke="var(--color-ink)"
              strokeOpacity={db === 0 ? 0.3 : 0.08}
            />
          ))}
          {gridF.map((f) => (
            <text
              key={f}
              x={xForFreq(f)}
              y={H - M.b + 14}
              textAnchor="middle"
              fontSize={10}
              fill="var(--color-ink)"
              fillOpacity={0.55}
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {f >= 1000 ? `${f / 1000}k` : f}
            </text>
          ))}
          <path
            d={path}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        </svg>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-ink/70">
            <span className="w-16 shrink-0">Type</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as BiquadFilterType)}
              className="flex-1 rounded border border-ink/15 bg-paper px-2 py-1 text-ink"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-ink/70">
            <span className="w-16 shrink-0">Freq</span>
            <input
              type="range"
              min={LOG_MIN}
              max={LOG_MAX}
              step={0.01}
              value={Math.log10(freq)}
              onChange={(e) => setFreq(Math.round(10 ** Number(e.target.value)))}
              className="flex-1 accent-accent"
            />
            <span className="w-20 shrink-0 whitespace-nowrap text-right tabular-nums normal-case">
              {freq >= 1000 ? `${(freq / 1000).toFixed(1)}k` : freq} Hz
            </span>
          </label>

          <label className="flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-ink/70">
            <span className="w-16 shrink-0">Q</span>
            <input
              type="range"
              min={0.1}
              max={12}
              step={0.1}
              value={q}
              onChange={(e) => setQ(Number(e.target.value))}
              className="flex-1 accent-accent"
            />
            <span className="w-20 shrink-0 whitespace-nowrap text-right tabular-nums normal-case">
              {q.toFixed(1)}
            </span>
          </label>

          <label className="flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-ink/70">
            <span className="w-16 shrink-0">Gain</span>
            <input
              type="range"
              min={-DB_RANGE}
              max={DB_RANGE}
              step={0.5}
              value={gain}
              onChange={(e) => setGain(Number(e.target.value))}
              className="flex-1 accent-accent"
            />
            <span className="w-20 shrink-0 whitespace-nowrap text-right tabular-nums normal-case">
              {gain > 0 ? `+${gain}` : gain} dB
            </span>
          </label>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? 'Stop pink noise' : 'Play pink noise'}
            className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-4 py-1.5 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-ink/70 transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {playing ? (
              <Pause className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <Play className="h-3.5 w-3.5" aria-hidden />
            )}
            {playing ? 'Stop' : 'Pink noise'}
          </button>
        </div>
      </div>
      {caption ? (
        <figcaption className="mt-2 text-center font-mono text-[0.72rem] uppercase tracking-[0.18em] text-ink/70">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
