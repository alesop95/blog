/**
 * Tiny Web Audio helper for the interactive music components (client-only).
 *
 * A single lazily-created AudioContext is shared across the page. `playChord`
 * sounds a set of pitches (given in semitones from middle C) through a short
 * triangle-wave envelope - enough to *hear* a chord without shipping a synth.
 * No-ops gracefully where Web Audio is unavailable.
 */

let ctx: AudioContext | null = null

/** The shared AudioContext, created on first use (needs a user gesture to run). */
export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  return ctx
}

/** True when the browser can play Web Audio. */
export function audioSupported(): boolean {
  if (typeof window === 'undefined') return false
  return Boolean(
    window.AudioContext ??
      (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext,
  )
}

const MIDDLE_C = 261.63 // C4 in Hz

/**
 * Play pitches (semitone offsets from middle C) as one chord.
 * e.g. a C major triad is `[0, 4, 7]`, A minor is `[9, 12, 16]`.
 */
export function playChord(semitones: number[], durationMs = 900): void {
  const audio = getAudioContext()
  if (!audio) return

  const schedule = () => {
    const now = audio.currentTime
    const end = now + durationMs / 1000
    const master = audio.createGain()
    master.connect(audio.destination)
    // Soft pluck envelope (exponential ramps must stay > 0).
    master.gain.setValueAtTime(0.0001, now)
    master.gain.exponentialRampToValueAtTime(0.18, now + 0.02)
    master.gain.exponentialRampToValueAtTime(0.0001, end)

    for (const semi of semitones) {
      const osc = audio.createOscillator()
      osc.type = 'triangle'
      osc.frequency.value = MIDDLE_C * 2 ** (semi / 12)
      osc.connect(master)
      osc.start(now)
      osc.stop(end + 0.05)
    }
  }

  // First gesture: the context is suspended - resume, THEN schedule at the
  // (now-running) clock, so the first chord isn't clipped or silent.
  if (audio.state === 'suspended') {
    audio.resume().then(schedule).catch(() => {})
  } else {
    schedule()
  }
}

const SEMITONE: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5,
  'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
}

/**
 * Build a triad from a key label such as "C", "Gb", "Am", "F#m".
 * A trailing "m" means minor (minor third); otherwise major.
 * Returns semitone offsets from middle C, or null if the root is unknown.
 */
export function triadFromLabel(label: string): number[] | null {
  const minor = label.endsWith('m')
  const root = minor ? label.slice(0, -1) : label
  const base = SEMITONE[root]
  if (base === undefined) return null
  const third = minor ? 3 : 4
  return [base, base + third, base + 7]
}
