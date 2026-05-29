import type { ComponentProps, ReactNode } from 'react'
import { siteConfig } from '@/config/site'
import { CodeBlock } from './CodeBlock'

/**
 * Custom components mapped into the MDX scope.
 * Authors can use <Callout>...</Callout> and <Figure src=... /> directly
 * inside `.mdx` files without importing anything.
 *
 * Anything not in this map falls back to native HTML elements styled by
 * the `.prose` block in globals.css.
 */

/**
 * Prefix root-relative asset paths with the deploy basePath (`/blog`).
 *
 * On static export, plain <img> tags do NOT get basePath applied the way
 * next/image and next/link do, so a root-relative `/images/x.png` would 404
 * on the project-site deploy. Resolve it here. Absolute URLs and already-
 * prefixed paths are left untouched. Authors store images under public/images/
 * and reference them as `/images/<slug>/<file>` — see ADR-005 / _notes.
 */
function resolveAsset(src?: string): string | undefined {
  if (!src) return src
  const base = siteConfig.basePath
  if (!src.startsWith('/')) return src // relative or remote-by-protocol
  if (base && src.startsWith(`${base}/`)) return src // already prefixed
  return `${base}${src}`
}

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

function Figure({ caption, alt, src, ...img }: FigureProps) {
  return (
    <figure className="my-8">
      {/* biome-ignore lint/a11y/useAltText: alt is forwarded from props */}
      <img {...img} src={resolveAsset(src as string | undefined)} alt={alt ?? ''} className="rounded-md" />
      {caption ? (
        <figcaption className="mt-2 text-center font-mono text-[0.72rem] uppercase tracking-[0.18em] text-ink/55">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}

/**
 * Maps the native markdown image syntax `![alt](/images/x.png "caption")`.
 * Resolves the basePath, renders responsively, and — when a `title` is given —
 * wraps it in a <figure> with the title as caption. Without a title it stays a
 * bare <img> so inline images don't force block layout.
 */
function MdxImage({ src, alt, title, ...rest }: ComponentProps<'img'>) {
  const resolved = resolveAsset(src as string | undefined)
  if (title) {
    return (
      <figure className="my-8">
        {/* biome-ignore lint/a11y/useAltText: alt is forwarded from markdown */}
        <img {...rest} src={resolved} alt={alt ?? ''} />
        <figcaption className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-ink/55">
          {title}
        </figcaption>
      </figure>
    )
  }
  // biome-ignore lint/a11y/useAltText: alt is forwarded from markdown
  return <img {...rest} src={resolved} alt={alt ?? ''} />
}

export const mdxComponents = {
  Callout,
  Figure,
  img: MdxImage,
  pre: CodeBlock,
}
