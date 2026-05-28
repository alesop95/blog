import type { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'
import { routing } from '@/i18n/routing'
import { getAllPosts } from '@/lib/posts'

// Emit a static sitemap.xml at build time (required by `output: export`).
export const dynamic = 'force-static'

/**
 * Bilingual sitemap with hreflang alternates.
 *
 * Every URL emitted carries `alternates.languages` so Google can
 * understand the EN ↔ IT pairs as translations of the same content.
 */

function postPath(locale: 'en' | 'it', slug: string): string {
  const localized =
    typeof routing.pathnames['/posts/[slug]'] === 'string'
      ? '/posts/[slug]'
      : routing.pathnames['/posts/[slug]'][locale]
  return `/${locale}${localized.replace('[slug]', slug)}`
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  // Home pages (per locale)
  const homeLanguages = Object.fromEntries(
    routing.locales.map((l) => [l, `${siteConfig.url}/${l}`]),
  )
  for (const locale of routing.locales) {
    entries.push({
      url: `${siteConfig.url}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates: { languages: homeLanguages },
    })
  }

  // Posts (per locale, paired with their gemella via articleId)
  const postsByLocale = await Promise.all(
    routing.locales.map(async (locale) => ({
      locale,
      posts: await getAllPosts(locale),
    })),
  )

  // Index posts by articleId across locales to build hreflang alternates.
  const byArticleId = new Map<string, Record<string, string>>()
  for (const { locale, posts } of postsByLocale) {
    for (const post of posts) {
      const id = post.frontmatter.articleId
      if (!id) continue
      const map = byArticleId.get(id) ?? {}
      map[locale] = `${siteConfig.url}${postPath(locale, post.slug)}`
      byArticleId.set(id, map)
    }
  }

  for (const { locale, posts } of postsByLocale) {
    for (const post of posts) {
      const url = `${siteConfig.url}${postPath(locale, post.slug)}`
      const id = post.frontmatter.articleId
      const languages = id ? byArticleId.get(id) : undefined

      entries.push({
        url,
        lastModified: post.frontmatter.updated ?? post.frontmatter.date,
        changeFrequency: 'monthly',
        priority: 0.8,
        ...(languages ? { alternates: { languages } } : {}),
      })
    }
  }

  return entries
}
