import { defineRouting } from 'next-intl/routing'

/**
 * The shape of our i18n routing.
 *
 * `localePrefix: 'always'` means every real route has either `/en/...` or
 * `/it/...` - never a bare URL. The bare root `/` is handled by a separate
 * splash page (`src/app/page.tsx`) that redirects browser-side.
 *
 * NOTE on localized post paths: the post collection uses a *localized URL
 * segment* (`/en/posts/...` ↔ `/it/articoli/...`). We do NOT express that via
 * next-intl `pathnames`, because next-intl's pathname localization relies on
 * the middleware to rewrite localized URLs to internal ones at request time -
 * and there is no middleware on a static export (GitHub Pages). Instead the
 * route segment is a real dynamic param (`[locale]/[section]/[slug]`) and we
 * generate the localized paths directly at build time. `postSection` /
 * `postPath` below are the single source of truth for that mapping. See ADR-006.
 */

export const routing = defineRouting({
  locales: ['en', 'it'] as const,
  defaultLocale: 'en',
  localePrefix: 'always',
  pathnames: {
    '/': '/',
  },
})

export type Locale = (typeof routing.locales)[number]

/** Runtime guard for unknown locale strings (e.g. from URL params). */
export function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value)
}

/**
 * The localized URL segment for the posts collection, per locale.
 * EN → `posts`, IT → `articoli`. Single source of truth - used by the route's
 * `generateStaticParams`, every post link, the sitemap, and the feeds.
 */
export function postSection(locale: Locale): string {
  return locale === 'it' ? 'articoli' : 'posts'
}

/**
 * Locale-prefixed path for a single post (no origin, no basePath).
 * e.g. `postPath('it', 'foo')` → `/it/articoli/foo`.
 * Prepend `siteConfig.url` for absolute URLs; pass straight to `next/link`
 * (which applies the basePath) for in-app navigation.
 */
export function postPath(locale: Locale, slug: string): string {
  return `/${locale}/${postSection(locale)}/${slug}`
}

/**
 * The localized URL segment for the tags collection, per locale.
 * EN → `tags`, IT → `tag`. Mirrors the post-section pattern (ADR-006): the
 * tag routes are static localized folders (`app/[locale]/tags`, `.../tag`),
 * so these helpers keep the localized word in one place.
 */
export function tagSection(locale: Locale): string {
  return locale === 'it' ? 'tag' : 'tags'
}

/** Locale-prefixed path for the tag index. e.g. `/it/tag`. */
export function tagsIndexPath(locale: Locale): string {
  return `/${locale}/${tagSection(locale)}`
}

/** Locale-prefixed path for a single tag page. e.g. `/en/tags/audio`. */
export function tagPath(locale: Locale, tag: string): string {
  return `/${locale}/${tagSection(locale)}/${encodeURIComponent(tag)}`
}

/**
 * The localized URL segment for the archive, per locale.
 * EN → `archive`, IT → `archivio`. Same static-localized-folder pattern as tags.
 */
export function archiveSection(locale: Locale): string {
  return locale === 'it' ? 'archivio' : 'archive'
}

/** Locale-prefixed path for the archive index. e.g. `/it/archivio`. */
export function archivePath(locale: Locale): string {
  return `/${locale}/${archiveSection(locale)}`
}

/**
 * The localized URL segment for the reviews index, per locale.
 * EN → `reviews`, IT → `recensioni`. Same static-localized-folder pattern as
 * tags/archive (ADR-006 addendum): a static segment beats the dynamic
 * `[section]` post route, so `/en/reviews` resolves to the index folder.
 */
export function reviewsSection(locale: Locale): string {
  return locale === 'it' ? 'recensioni' : 'reviews'
}

/** Locale-prefixed path for the reviews index. e.g. `/it/recensioni`. */
export function reviewsPath(locale: Locale): string {
  return `/${locale}/${reviewsSection(locale)}`
}

/**
 * The localized URL segment for series, per locale. EN → `series`, IT → `serie`.
 * Same static-localized-folder pattern as tags/archive/reviews (ADR-006 addendum).
 */
export function seriesSection(locale: Locale): string {
  return locale === 'it' ? 'serie' : 'series'
}

/**
 * Locale-prefixed path for the series index. e.g. `/it/serie`. A single series
 * is a `#<slug>` anchor on this page (no per-series route - keeps the static
 * export safe when there are zero series).
 */
export function seriesIndexPath(locale: Locale): string {
  return `/${locale}/${seriesSection(locale)}`
}

/**
 * The localized URL segment for the year-in-review pages, per locale.
 * EN → `year`, IT → `anno`.
 */
export function yearSection(locale: Locale): string {
  return locale === 'it' ? 'anno' : 'year'
}

/** Locale-prefixed path for a year-in-review page. e.g. `/it/anno/2026`. */
export function yearPath(locale: Locale, year: number): string {
  return `/${locale}/${yearSection(locale)}/${year}`
}
