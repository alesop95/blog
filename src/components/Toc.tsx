import type { TocEntry } from '@/lib/toc'

/**
 * Inline, collapsible table of contents for long posts.
 *
 * Native `<details>` — open by default, keyboard-accessible, zero JS. Links are
 * fragment-only (`#id`), so they need no basePath. The post page decides when to
 * render this (word count + heading count gate).
 */
export function Toc({ entries, label }: { entries: TocEntry[]; label: string }) {
  return (
    <details
      open
      className="my-8 rounded-md border border-ink/12 bg-ink/[0.02] px-5 py-3"
    >
      <summary className="cursor-pointer select-none font-mono text-[0.72rem] uppercase tracking-[0.18em] text-ink/55 transition-colors hover:text-accent">
        {label}
      </summary>
      <nav aria-label={label} className="mt-3">
        <ol className="space-y-1.5 text-[0.95rem] leading-snug">
          {entries.map((entry) => (
            <li key={entry.id} className={entry.depth === 3 ? 'ml-4' : ''}>
              <a
                href={`#${entry.id}`}
                className="text-ink/75 underline-offset-2 transition-colors hover:text-accent hover:underline"
              >
                {entry.text}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </details>
  )
}
