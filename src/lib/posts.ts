/**
 * The blog's bilingual post collection.
 *
 * Posts live as `.mdx` files in `content/posts/{en,it}/`. Each has YAML
 * frontmatter validated by a Zod schema – invalid frontmatter fails the
 * build, on purpose.
 *
 * This module is *the* source of truth. Every route that needs posts
 * goes through here. Do not read `content/posts/` from anywhere else.
 */

import type { Dirent } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import { z } from 'zod'
import type { Locale } from '@/i18n/routing'
import { routing } from '@/i18n/routing'

const POSTS_ROOT = join(process.cwd(), 'content', 'posts')

/**
 * Frontmatter contract. Update here, schema-checked everywhere.
 *
 * `articleId` pairs translations of the same post across locales:
 * two posts with the same `articleId` (one in /en/, one in /it/)
 * are considered translations of each other.
 */
const PostFrontmatterSchema = z.object({
  title: z.string().min(1, 'title is required'),
  description: z.string().min(1).max(280),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  cover: z.string().url().optional(),
  /** Stable identifier shared across locale translations of the same article. */
  articleId: z.string().min(1).optional(),
})

export type PostFrontmatter = z.infer<typeof PostFrontmatterSchema>

export interface Post {
  locale: Locale
  slug: string
  frontmatter: PostFrontmatter
  content: string
  readingTime: {
    minutes: number
    words: number
  }
}

/**
 * Read & parse a single post by (locale, slug).
 * Throws if the file is missing or the frontmatter is malformed.
 */
async function readPost(locale: Locale, slug: string): Promise<Post> {
  const filePath = join(POSTS_ROOT, locale, `${slug}.mdx`)
  const raw = await readFile(filePath, 'utf-8')
  const { data, content } = matter(raw)

  const parsed = PostFrontmatterSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(
      `Invalid frontmatter in ${locale}/${slug}.mdx:\n${parsed.error.issues
        .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
        .join('\n')}`,
    )
  }

  const stats = readingTime(content)

  return {
    locale,
    slug,
    frontmatter: parsed.data,
    content,
    readingTime: {
      minutes: Math.max(1, Math.round(stats.minutes)),
      words: stats.words,
    },
  }
}

/**
 * Cached post collection per locale. Read once per build.
 */
const postCache = new Map<Locale, Post[]>()

async function loadPostsForLocale(locale: Locale): Promise<Post[]> {
  const cached = postCache.get(locale)
  if (cached) return cached

  const dir = join(POSTS_ROOT, locale)
  let entries: Dirent<string>[]
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    // Folder doesn't exist → no posts for this locale (acceptable).
    postCache.set(locale, [])
    return []
  }

  const slugs = entries
    .filter((e) => e.isFile() && e.name.endsWith('.mdx'))
    .map((e) => e.name.replace(/\.mdx$/, ''))

  const posts = await Promise.all(slugs.map((slug) => readPost(locale, slug)))

  const visible =
    process.env.NODE_ENV === 'production'
      ? posts.filter((p) => !p.frontmatter.draft)
      : posts

  visible.sort(
    (a, b) =>
      b.frontmatter.date.getTime() - a.frontmatter.date.getTime(),
  )

  postCache.set(locale, visible)
  return visible
}

/* -------------------------------------------------------------------------- */
/*  Public API                                                                */
/* -------------------------------------------------------------------------- */

export async function getAllPosts(locale: Locale): Promise<Post[]> {
  return loadPostsForLocale(locale)
}

export async function getAllPostsAcrossLocales(): Promise<Post[]> {
  const buckets = await Promise.all(
    routing.locales.map((l) => loadPostsForLocale(l)),
  )
  return buckets.flat()
}

export async function getPostBySlug(
  locale: Locale,
  slug: string,
): Promise<Post | null> {
  const all = await loadPostsForLocale(locale)
  return all.find((p) => p.slug === slug) ?? null
}

export async function getAllSlugs(locale: Locale): Promise<string[]> {
  const all = await loadPostsForLocale(locale)
  return all.map((p) => p.slug)
}

export async function getAdjacentPosts(
  locale: Locale,
  slug: string,
): Promise<{ previous: Post | null; next: Post | null }> {
  const all = await loadPostsForLocale(locale)
  const idx = all.findIndex((p) => p.slug === slug)
  if (idx === -1) return { previous: null, next: null }
  return {
    previous: all[idx + 1] ?? null,
    next: all[idx - 1] ?? null,
  }
}

/**
 * Find the translation gemella of a post in the other locale, via `articleId`.
 * Returns null if the post has no articleId or no translation exists.
 */
export async function getTranslation(post: Post): Promise<Post | null> {
  if (!post.frontmatter.articleId) return null

  const otherLocale = routing.locales.find((l) => l !== post.locale)
  if (!otherLocale) return null

  const others = await loadPostsForLocale(otherLocale)
  return (
    others.find((p) => p.frontmatter.articleId === post.frontmatter.articleId) ??
    null
  )
}
