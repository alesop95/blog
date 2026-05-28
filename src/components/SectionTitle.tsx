import type { ReactNode } from 'react'

interface SectionTitleProps {
  children: ReactNode
}

/**
 * Editorial section header. Small monospace label with a hairline underline.
 */
export function SectionTitle({ children }: SectionTitleProps) {
  return (
    <div className="mb-6 flex items-baseline gap-3">
      <h2 className="font-mono text-xs uppercase tracking-[0.24em] text-ink/60">
        {children}
      </h2>
      <span aria-hidden className="h-px flex-1 bg-ink/15" />
    </div>
  )
}
