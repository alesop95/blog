import type { ComponentProps, ReactNode } from 'react'
import { siteConfig } from '@/config/site'
import { CodeBlock } from './CodeBlock'
import { EQGraph } from './EQGraph'
import { HarmonyDiagram } from './HarmonyDiagram'
import { PedalSignalFlow } from './PedalSignalFlow'
import { Score } from './Score'

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
    // role="note", not <aside>: an in-prose callout is not a page-level
    // complementary landmark (axe: landmark-complementary-is-top-level).
    <div
      role="note"
      className={`my-6 rounded-md border-l-2 px-5 py-3 text-[0.95em] ${tone}`}
    >
      {children}
    </div>
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

interface DiagramProps extends ComponentProps<'img'> {
  caption?: string
  /** Break out wider than the prose column on large screens (big schematics). */
  wide?: boolean
}

/**
 * Engineering diagram: a schematic, plot, or `circuitikz`/TikZ figure exported
 * to SVG (see _notes/AUTHORING-ENGINEERING.md). Unlike <Figure>, it sits on an
 * always-light "plate" so black-stroke vector diagrams stay legible in dark
 * mode, and it scrolls horizontally instead of squashing. Use `wide` for large
 * schematics that need to break out of the reading column.
 */
function Diagram({ caption, alt, src, wide = false, ...img }: DiagramProps) {
  return (
    <figure className={`diagram my-8${wide ? ' diagram--wide' : ''}`}>
      <div className="diagram__plate">
        {/* biome-ignore lint/a11y/useAltText: alt is forwarded from props */}
        <img {...img} src={resolveAsset(src as string | undefined)} alt={alt ?? ''} />
      </div>
      {caption ? (
        <figcaption className="mt-2 text-center font-mono text-[0.72rem] uppercase tracking-[0.18em] text-ink/55">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}

interface YouTubeProps {
  /** The video id, e.g. `O0jxbzUqWXw` (the `v=` value from a watch URL). */
  id: string
  /** Accessible iframe title. */
  title?: string
  /** Short line shown under the player (the post body can carry the long text). */
  caption?: string
}

/**
 * Responsive 16:9 YouTube embed via the privacy-friendly `youtube-nocookie`
 * domain. Lazy-loaded. Pass only the bare video `id` (strip any `&list=…` /
 * `&index=…` query). Optional `caption` renders under the player.
 */
function YouTube({ id, title, caption }: YouTubeProps) {
  return (
    <figure className="my-8">
      <div className="aspect-video w-full overflow-hidden rounded-md border border-ink/10">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={title ?? 'YouTube video'}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      {caption ? (
        <figcaption className="mt-2 text-center font-mono text-[0.72rem] uppercase tracking-[0.18em] text-ink/55">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}

interface VideoProps {
  /** Path to a self-hosted file under public/, e.g. `/videos/<slug>/clip.mp4`. */
  src: string
  /** Optional poster image shown before playback. */
  poster?: string
  /** Optional line under the player (the post body can hold the long description). */
  caption?: string
}

/**
 * Self-hosted video player (your own uploaded file, not a YouTube embed).
 * Drop the file under `public/videos/<slug>/` and reference it with a
 * root-relative path; the basePath is resolved automatically. Keep files small
 * (compress before commit) — GitHub blocks files >100 MB and Pages has limits.
 */
function Video({ src, poster, caption }: VideoProps) {
  return (
    <figure className="my-8">
      {/* biome-ignore lint/a11y/useMediaCaption: editorial clip; the description lives below / in the body */}
      <video
        className="w-full rounded-md border border-ink/10"
        controls
        preload="metadata"
        src={resolveAsset(src)}
        poster={poster ? resolveAsset(poster) : undefined}
      />
      {caption ? (
        <figcaption className="mt-2 text-center font-mono text-[0.72rem] uppercase tracking-[0.18em] text-ink/55">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}

interface QuoteProps {
  children: ReactNode
  /** Optional attribution shown under the quote. */
  cite?: string
}

/**
 * Editorial pull-quote: a centred, display-serif highlight pulled out of the
 * prose. Rendered as a <figure>/<p> (not <blockquote>) so it doesn't inherit
 * the left-bordered blockquote styling; see `.pullquote` in globals.css.
 */
function Quote({ children, cite }: QuoteProps) {
  return (
    <figure className="pullquote my-10">
      <p>{children}</p>
      {cite ? <figcaption>– {cite}</figcaption> : null}
    </figure>
  )
}

export const mdxComponents = {
  Callout,
  Figure,
  Diagram,
  YouTube,
  Video,
  Quote,
  Score,
  HarmonyDiagram,
  EQGraph,
  PedalSignalFlow,
  img: MdxImage,
  pre: CodeBlock,
}
