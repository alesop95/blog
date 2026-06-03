import type { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'
import {
  archivePath,
  postPath,
  reviewsPath,
  routing,
  seriesIndexPath,
  tagPath,
  tagsIndexPath,
  yearPath,
} from '@/i18n/routing'
import { getAllPosts, getAllTags, getPostsByYear } from '@/lib/posts'

// Emit a static sitemap.xml at build time (required by `output: export`).
export const dynamic = 'force-static'

/**
 * Bilingual sitemap with hreflang alternates.
 *
 * Every URL emitted carries `alternates.languages` so Google can
 * understand the EN ↔ IT pairs as translations of the same content.
 * Post paths use the shared `postPath` helper (localized: en /posts/, it /articoli/).
 */

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

  // Tag index per locale, paired across locales (en /tags ↔ it /tag).
  const tagIndexLanguages = Object.fromEntries(
    routing.locales.map((l) => [l, `${siteConfig.url}${tagsIndexPath(l)}`]),
  )
  for (const locale of routing.locales) {
    entries.push({
      url: `${siteConfig.url}${tagsIndexPath(locale)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
      alternates: { languages: tagIndexLanguages },
    })
  }

  // Archive index per locale, paired across locales (en /archive ↔ it /archivio).
  const archiveLanguages = Object.fromEntries(
    routing.locales.map((l) => [l, `${siteConfig.url}${archivePath(l)}`]),
  )
  for (const locale of routing.locales) {
    entries.push({
      url: `${siteConfig.url}${archivePath(locale)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
      alternates: { languages: archiveLanguages },
    })
  }

  // Reviews index per locale, paired across locales (en /reviews ↔ it /recensioni).
  const reviewsLanguages = Object.fromEntries(
    routing.locales.map((l) => [l, `${siteConfig.url}${reviewsPath(l)}`]),
  )
  for (const locale of routing.locales) {
    entries.push({
      url: `${siteConfig.url}${reviewsPath(locale)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
      alternates: { languages: reviewsLanguages },
    })
  }

  // Series index per locale, paired across locales (en /series ↔ it /serie).
  const seriesLanguages = Object.fromEntries(
    routing.locales.map((l) => [l, `${siteConfig.url}${seriesIndexPath(l)}`]),
  )
  for (const locale of routing.locales) {
    entries.push({
      url: `${siteConfig.url}${seriesIndexPath(locale)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.4,
      alternates: { languages: seriesLanguages },
    })
  }

  // Single-tag pages (tags differ per locale, so no cross-locale alternates).
  for (const locale of routing.locales) {
    const tags = await getAllTags(locale)
    for (const { tag } of tags) {
      entries.push({
        url: `${siteConfig.url}${tagPath(locale, tag)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.4,
      })
    }
  }

  // Year-in-review pages, paired across locales (en /year/Y ↔ it /anno/Y).
  for (const locale of routing.locales) {
    const years = await getPostsByYear(locale)
    for (const { year } of years) {
      const yearLanguages = Object.fromEntries(
        routing.locales.map((l) => [l, `${siteConfig.url}${yearPath(l, year)}`]),
      )
      entries.push({
        url: `${siteConfig.url}${yearPath(locale, year)}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.3,
        alternates: { languages: yearLanguages },
      })
    }
  }

  return entries
}
