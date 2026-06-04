'use client'

import { Pause, Play } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface ScoreProps {
  /** ABC notation source (https://abcnotation.com/). */
  abc: string
  /** Optional caption under the score. */
  caption?: string
}

// Minimal shapes of the abcjs bits we touch (abcjs ships loose types for synth).
type AbcjsModule = typeof import('abcjs')
interface VisualTune {
  getTotalTime?: () => number
}
interface Synth {
  init(opts: object): Promise<unknown>
  prime(): Promise<unknown>
  start(): Promise<unknown>
  stop(): void
}

/**
 * Renders ABC notation as an engraved score via abcjs, client-side, with an
 * optional play button. The library is dynamically imported on mount (bundled
 * only for pages that use a <Score>). The score sits on an always-light "plate"
 * (shared with <Diagram>) so the black notation stays legible in dark mode.
 *
 * Playback: a Web Audio synth (abcjs) is created lazily on the first play click
 * (browsers require a user gesture to start audio); the soundfont is fetched on
 * demand. The button is hidden where Web Audio isn't supported.
 *
 *   <Score abc={`X:1\nK:C\nC D E F | G A B c |`} caption="C major scale" />
 */
export function Score({ abc, caption }: ScoreProps) {
  const ref = useRef<HTMLDivElement>(null)
  const abcjsRef = useRef<AbcjsModule | null>(null)
  const visualRef = useRef<VisualTune | null>(null)
  const synthRef = useRef<Synth | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const timerRef = useRef<number | null>(null)
  const [canPlay, setCanPlay] = useState(false)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    let cancelled = false
    import('abcjs')
      .then((abcjs) => {
        if (cancelled || !ref.current) return
        abcjsRef.current = abcjs
        const visual = abcjs.renderAbc(ref.current, abc, {
          responsive: 'resize',
          add_classes: true,
        })
        visualRef.current = (visual?.[0] as VisualTune) ?? null
        if (abcjs.synth.supportsAudio()) setCanPlay(true)
      })
      .catch(() => {
        // abcjs failed to load - leave the ABC source as a readable fallback.
        if (ref.current) ref.current.textContent = abc
      })
    return () => {
      cancelled = true
      if (timerRef.current) window.clearTimeout(timerRef.current)
      synthRef.current?.stop()
      void ctxRef.current?.close()
    }
  }, [abc])

  const stop = useCallback(() => {
    synthRef.current?.stop()
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setPlaying(false)
  }, [])

  const toggle = useCallback(async () => {
    const abcjs = abcjsRef.current
    const visual = visualRef.current
    if (!abcjs || !visual) return
    if (playing) {
      stop()
      return
    }
    try {
      if (!ctxRef.current) {
        const Ctor =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext
        if (!Ctor) {
          setCanPlay(false)
          return
        }
        ctxRef.current = new Ctor()
      }
      await ctxRef.current.resume()
      if (!synthRef.current) {
        const synth = new abcjs.synth.CreateSynth() as unknown as Synth
        await synth.init({ audioContext: ctxRef.current, visualObj: visual })
        await synth.prime()
        synthRef.current = synth
      }
      await synthRef.current.start()
      setPlaying(true)
      // Auto-reset the button when the tune finishes (getTotalTime is in seconds).
      const seconds = visual.getTotalTime?.() ?? 0
      if (seconds > 0) {
        timerRef.current = window.setTimeout(
          () => setPlaying(false),
          seconds * 1000 + 250,
        )
      }
    } catch {
      setCanPlay(false)
    }
  }, [playing, stop])

  return (
    <figure className="my-8">
      <div className="diagram__plate">
        {/* abcjs injects an SVG here on mount; pre-hydration this is empty. */}
        <div ref={ref} role="img" aria-label="Musical score" />
      </div>
      <figcaption className="mt-2 flex items-center justify-center gap-3 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-ink/70">
        {canPlay ? (
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? 'Stop' : 'Play'}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-ink/20 text-ink/70 transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent print:hidden"
          >
            {playing ? (
              <Pause className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <Play className="h-3.5 w-3.5" aria-hidden />
            )}
          </button>
        ) : null}
        {caption ? <span>{caption}</span> : null}
      </figcaption>
    </figure>
  )
}
