import type { ComponentProps, ReactNode } from 'react'
import { CodeBlock } from './CodeBlock'

/**
 * Custom components mapped into the MDX scope.
 * Authors can use <Callout>...</Callout> and <Figure src=... /> directly
 * inside `.mdx` files without importing anything.
 *
 * Anything not in this map falls back to native HTML elements styled by
 * the `.prose` block in globals.css.
 */

interface CalloutProps {
  kind?: 'info' | 'warn' | 'aside'
  children: ReactNode
}

function Callout({ kind = 'info', children }: CalloutProps) {
  const tone = {
    info: 'border-accent/35 bg-accent/8',
    warn: 'border-amber-500/40 bg-amber-500/8',
    aside: 'border-ink/15 bg-ink/4',
  }[kind]

  return (
    <aside
      className={`my-6 rounded-md border-l-2 px-5 py-3 text-[0.95em] ${tone}`}
    >
      {children}
    </aside>
  )
}

interface FigureProps extends ComponentProps<'img'> {
  caption?: string
}

function Figure({ caption, alt, ...img }: FigureProps) {
  return (
    <figure className="my-8">
      {/* biome-ignore lint/a11y/useAltText: alt is forwarded from props */}
      <img {...img} alt={alt ?? ''} className="rounded-md" />
      {caption ? (
        <figcaption className="mt-2 text-center font-mono text-[0.72rem] uppercase tracking-[0.18em] text-ink/55">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}

export const mdxComponents = {
  Callout,
  Figure,
  pre: CodeBlock,
}
