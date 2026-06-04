import { ChevronRight } from 'lucide-react'
import { Fragment } from 'react'

interface PedalSignalFlowProps {
  /** Ordered stages of the signal chain, e.g. ["Guitar", "Tuner", "Drive", "Amp"]. */
  chain: string[]
  /** Optional caption under the diagram. */
  caption?: string
}

/**
 * A guitar/audio signal chain rendered as labelled stages joined by arrows.
 * Plain HTML (not SVG) so it stays responsive and dark-mode-native; scrolls
 * horizontally on narrow screens. For pedal-circuit / routing posts.
 *
 *   <PedalSignalFlow chain={["Guitar", "Tuner", "Overdrive", "Delay", "Amp"]} />
 */
export function PedalSignalFlow({ chain, caption }: PedalSignalFlowProps) {
  return (
    <figure className="my-8">
      {/* tabIndex makes the scrollable chain keyboard-scrollable (axe:
          scrollable-region-focusable). */}
      <div
        className="overflow-x-auto"
        // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable region must be keyboard-focusable
        tabIndex={0}
      >
        <ol className="flex min-w-max items-stretch gap-2">
          {chain.map((stage, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: stages can legitimately repeat (e.g. two delays), so the index disambiguates
            <Fragment key={`${stage}-${i}`}>
              <li className="flex items-center justify-center rounded-md border border-ink/15 bg-ink/[0.03] px-4 py-3 text-center font-mono text-[0.8rem] uppercase tracking-[0.12em] text-ink/80">
                {stage}
              </li>
              {i < chain.length - 1 ? (
                <li aria-hidden className="flex items-center text-accent">
                  <ChevronRight className="h-5 w-5" />
                </li>
              ) : null}
            </Fragment>
          ))}
        </ol>
      </div>
      {caption ? (
        <figcaption className="mt-2 text-center font-mono text-[0.72rem] uppercase tracking-[0.18em] text-ink/55">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
