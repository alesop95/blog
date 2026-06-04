'use client'

import { useEffect, useState } from 'react'
import type { TocEntry } from '@/lib/toc'

/**
 * Inline, collapsible table of contents for long posts, with scroll-spy: the
 * link for the section currently near the top of the viewport is highlighted
 * (an IntersectionObserver watches the real headings by id). Native `<details>`
 * keeps it keyboard-accessible and open by default. Links are fragment-only
 * (`#id`), so they need no basePath.
 */
export function Toc({ entries, label }: { entries: TocEntry[]; label: string }) {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const els = entries
      .map((e) => document.getElementById(e.id))
      .filter((el): el is HTMLElement => el !== null)
    if (els.length === 0) return

    const observer = new IntersectionObserver(
      (items) => {
        const onscreen = items
          .filter((i) => i.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (onscreen[0]) setActive(onscreen[0].target.id)
      },
      // A heading counts as "active" once it reaches the top ~30% of the viewport.
      { rootMargin: '0px 0px -70% 0px', threshold: 0 },
    )
    for (const el of els) observer.observe(el)
    return () => observer.disconnect()
  }, [entries])

  return (
    <details
      open
      className="my-8 rounded-md border border-ink/12 bg-ink/[0.02] px-5 py-3 print:hidden"
    >
      <summary className="cursor-pointer select-none font-mono text-[0.72rem] uppercase tracking-[0.18em] text-ink/70 transition-colors hover:text-accent">
        {label}
      </summary>
      <nav aria-label={label} className="mt-3">
        <ol className="space-y-1.5 text-[0.95rem] leading-snug">
          {entries.map((entry) => {
            const current = active === entry.id
            return (
              <li key={entry.id} className={entry.depth === 3 ? 'ml-4' : ''}>
                <a
                  href={`#${entry.id}`}
                  aria-current={current ? 'location' : undefined}
                  className={`underline-offset-2 transition-colors hover:text-accent hover:underline ${
                    current ? 'text-accent' : 'text-ink/75'
                  }`}
                >
                  {entry.text}
                </a>
              </li>
            )
          })}
        </ol>
      </nav>
    </details>
  )
}
