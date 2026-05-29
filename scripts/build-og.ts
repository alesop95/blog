/**
 * Build-time Open Graph image generation.
 *
 * Renders one 1200×630 PNG per post per locale into `public/og/<locale>/<slug>.png`,
 * plus a default site card at `public/og/default.png`.
 *
 * Pipeline: satori → SVG → sharp → PNG.
 *
 * Why build-time rather than `next/og` at runtime?
 * GitHub Pages serves only static files; there is no Edge runtime to handle
 * dynamic OG. Pre-rendering at build is the static-site equivalent.
 *
 * @see https://github.com/vercel/satori
 */

import type { Dirent } from 'node:fs'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import satori from 'satori'
import sharp from 'sharp'

/* -------------------------------------------------------------------------- */
/*  Paths                                                                     */
/* -------------------------------------------------------------------------- */

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const POSTS_DIR = join(ROOT, 'content', 'posts')
const OUT_DIR = join(ROOT, 'public', 'og')

const LOCALES = ['en', 'it'] as const
type Locale = (typeof LOCALES)[number]

/* -------------------------------------------------------------------------- */
/*  Fonts                                                                     */
/*                                                                            */
/*  satori needs raw font buffers. We pull two weights of Inter from the      */
/*  Google Fonts API at build time. (Network is allowed in this script;       */
/*  for a fully offline build, vendor the .ttf files into `public/fonts/`     */
/*  and read them via readFile instead.)                                      */
/* -------------------------------------------------------------------------- */

async function loadGoogleFont(family: string, weight: 400 | 700): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}&display=swap`
  const cssRes = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OGBuilder/1.0)' },
  })
  const css = await cssRes.text()
  const match = css.match(/src: url\((.+?)\) format\('truetype'\)/)
  if (!match || !match[1]) {
    throw new Error(`Could not extract font URL for ${family} ${weight} from CSS`)
  }
  const fontRes = await fetch(match[1])
  return await fontRes.arrayBuffer()
}

/* -------------------------------------------------------------------------- */
/*  Card template                                                             */
/* -------------------------------------------------------------------------- */

interface CardProps {
  title: string
  subtitle: string
  locale: Locale
  /** "writings" / "scritti" – the section label */
  section: string
  /** Already-localized reading time, e.g. "5 min read" / "5 min di lettura". */
  readingLabel?: string
  /** First tag of the post, without the leading '#'. */
  tag?: string
}

/** A small rounded pill used in the card footer for meta (reading time, tag). */
function metaPill(text: string, accent: boolean) {
  return {
    type: 'div',
    props: {
      style: {
        padding: '6px 14px',
        border: `2px solid ${accent ? '#c8772f' : '#ded7ca'}`,
        borderRadius: 999,
        fontSize: 20,
        letterSpacing: 1,
        color: accent ? '#c8772f' : '#6b6863',
      },
      children: text,
    },
  }
}

function buildCard({ title, subtitle, locale, section, readingLabel, tag }: CardProps) {
  const metaPills = [
    readingLabel ? metaPill(readingLabel, false) : null,
    tag ? metaPill(`#${tag}`, true) : null,
  ].filter(Boolean)
  return {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '80px',
        background: '#fbf9f5',
        color: '#1d1c1a',
        fontFamily: 'Inter',
      },
      children: [
        // Header strip: site name + locale chip
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 22,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: '#6b6863',
            },
            children: [
              {
                type: 'div',
                props: { children: 'Alessio Sopranzi' },
              },
              {
                type: 'div',
                props: {
                  style: {
                    padding: '6px 14px',
                    border: '2px solid #c8772f',
                    borderRadius: 999,
                    color: '#c8772f',
                  },
                  children: locale.toUpperCase(),
                },
              },
            ],
          },
        },
        // Title block
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', gap: 24 },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontFamily: 'Fraunces',
                    fontSize: 60,
                    fontWeight: 700,
                    lineHeight: 1.1,
                    letterSpacing: -1,
                  },
                  children: title,
                },
              },
              {
                type: 'div',
                props: {
                  style: { fontSize: 26, color: '#46443f', lineHeight: 1.4 },
                  children: subtitle,
                },
              },
            ],
          },
        },
        // Footer: section label + hairline accent (left), meta pills (right)
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', gap: 20 },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: { height: 3, width: 60, background: '#c8772f' },
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: 20,
                          letterSpacing: 4,
                          textTransform: 'uppercase',
                          color: '#6b6863',
                        },
                        children: section,
                      },
                    },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', gap: 12 },
                  children: metaPills,
                },
              },
            ],
          },
        },
      ],
    },
  }
}

/* -------------------------------------------------------------------------- */
/*  Rendering                                                                 */
/* -------------------------------------------------------------------------- */

async function renderPng(
  element: ReturnType<typeof buildCard>,
  fonts: Array<{ name: string; data: ArrayBuffer; weight: 400 | 700; style: 'normal' }>,
  outPath: string,
) {
  // @ts-expect-error – satori's JSX type accepts our hand-built node
  const svg = await satori(element, { width: 1200, height: 630, fonts })
  const png = await sharp(Buffer.from(svg)).png({ quality: 95 }).toBuffer()
  await mkdir(dirname(outPath), { recursive: true })
  await writeFile(outPath, png)
}

/* -------------------------------------------------------------------------- */
/*  Discover posts by reading the filesystem directly                         */
/*  (We avoid importing src/lib/posts.ts so this script stays standalone.)    */
/* -------------------------------------------------------------------------- */

interface PostMeta {
  locale: Locale
  slug: string
  title: string
  description: string
  /** Whole minutes, mirroring src/lib/posts.ts so the badge matches the site. */
  readingMinutes: number
  /** First tag, if any. */
  tag?: string
}

async function discoverPosts(): Promise<PostMeta[]> {
  const result: PostMeta[] = []
  for (const locale of LOCALES) {
    const dir = join(POSTS_DIR, locale)
    let entries: Dirent<string>[]
    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch {
      continue
    }
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.mdx')) continue
      const slug = entry.name.replace(/\.mdx$/, '')
      const raw = await readFile(join(dir, entry.name), 'utf-8')
      const { data, content } = matter(raw)
      if (data.draft === true && process.env.NODE_ENV === 'production') continue
      const tags = Array.isArray(data.tags) ? data.tags : []
      result.push({
        locale,
        slug,
        title: String(data.title ?? slug),
        description: String(data.description ?? ''),
        readingMinutes: Math.max(1, Math.round(readingTime(content).minutes)),
        tag: tags[0] ? String(tags[0]) : undefined,
      })
    }
  }
  return result
}

/* -------------------------------------------------------------------------- */
/*  Main                                                                      */
/* -------------------------------------------------------------------------- */

async function main() {
  console.log('▸ Building OG images...')

  const [regular, bold, fraunces] = await Promise.all([
    loadGoogleFont('Inter', 400),
    loadGoogleFont('Inter', 700),
    // Fraunces is the site's display serif – used for the card title so the
    // OG image speaks in the same voice as the page <h1>.
    loadGoogleFont('Fraunces', 700),
  ])
  const fonts = [
    { name: 'Inter', data: regular, weight: 400 as const, style: 'normal' as const },
    { name: 'Inter', data: bold, weight: 700 as const, style: 'normal' as const },
    { name: 'Fraunces', data: fraunces, weight: 700 as const, style: 'normal' as const },
  ]

  // 1) Default site card
  await renderPng(
    buildCard({
      title: 'Alessio Sopranzi – writings',
      subtitle:
        'Engineering, music, audio, and the philosophy of how things actually work.',
      locale: 'en',
      section: 'writings',
    }),
    fonts,
    join(OUT_DIR, 'default.png'),
  )
  console.log('  ✓ default.png')

  // 2) Per-post cards
  const posts = await discoverPosts()
  for (const post of posts) {
    const section = post.locale === 'it' ? 'scritti' : 'writings'
    const readingLabel =
      post.locale === 'it'
        ? `${post.readingMinutes} min di lettura`
        : `${post.readingMinutes} min read`
    await renderPng(
      buildCard({
        title: post.title,
        subtitle: post.description,
        locale: post.locale,
        section,
        readingLabel,
        tag: post.tag,
      }),
      fonts,
      join(OUT_DIR, post.locale, `${post.slug}.png`),
    )
    console.log(`  ✓ ${post.locale}/${post.slug}.png`)
  }

  console.log(`▸ OG done (${posts.length + 1} images).`)
}

main().catch((err) => {
  console.error('OG build failed:', err)
  process.exit(1)
})
