'use client'

import { useEffect, useRef } from 'react'

interface ScoreProps {
  /** ABC notation source (https://abcnotation.com/). */
  abc: string
  /** Optional caption under the score. */
  caption?: string
}

/**
 * Renders ABC notation as an engraved score via abcjs, client-side. The library
 * is dynamically imported on mount, so it's bundled only for pages that actually
 * use a <Score> (not every post). The score sits on an always-light "plate"
 * (shared with <Diagram>) so the black notation stays legible in dark mode.
 *
 *   <Score abc={`X:1\nK:C\nC D E F | G A B c |`} caption="C major scale" />
 */
export function Score({ abc, caption }: ScoreProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    import('abcjs')
      .then((abcjs) => {
        if (cancelled || !ref.current) return
        abcjs.renderAbc(ref.current, abc, {
          responsive: 'resize',
          add_classes: true,
        })
      })
      .catch(() => {
        // abcjs failed to load — leave the ABC source as a readable fallback.
        if (ref.current) ref.current.textContent = abc
      })
    return () => {
      cancelled = true
    }
  }, [abc])

  return (
    <figure className="my-8">
      <div className="diagram__plate">
        {/* abcjs injects an SVG here on mount; pre-hydration this is empty. */}
        <div ref={ref} role="img" aria-label="Musical score" />
      </div>
      {caption ? (
        <figcaption className="mt-2 text-center font-mono text-[0.72rem] uppercase tracking-[0.18em] text-ink/55">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
