/**
 * RSS / Atom / JSON Feed generator, per locale.
 *
 * One source-of-truth → three output formats, one feed per language.
 * EN feed lives at /en/feed.xml, IT at /it/feed.xml.
 */

import { Feed } from 'feed'
import { siteConfig } from '@/config/site'
import type { Locale } from '@/i18n/routing'
import { routing } from '@/i18n/routing'
import { getAllPosts } from './posts'

/** Builds the locale-prefixed URL for a post, using the localized pathname. */
function postUrl(locale: Locale, slug: string): string {
  const pathnames = routing.pathnames['/posts/[slug]']
  const localized =
    typeof pathnames === 'string' ? pathnames : pathnames[locale]
  const path = localized.replace('[slug]', slug)
  return `${siteConfig.url}/${locale}${path}`
}

export async function buildFeed(locale: Locale): Promise<Feed> {
  const posts = await getAllPosts(locale)

  const homeUrl = `${siteConfig.url}/${locale}`
  const language = locale

  // Locale-specific title & description (we keep them inline here to avoid
  // a circular import on next-intl server helpers in this leaf module).
  const title =
    locale === 'it'
      ? 'Alessio Sopranzi – scritti'
      : 'Alessio Sopranzi – writings'
  const description =
    locale === 'it'
      ? "Scritti personali di Alessio Sopranzi all'incrocio fra ingegneria, musica, audio e la filosofia di come le cose funzionano davvero."
      : 'Personal writings of Alessio Sopranzi at the intersection of engineering, music, audio, and the philosophy of how things actually work.'

  const feed = new Feed({
    title,
    description,
    id: homeUrl,
    link: homeUrl,
    language,
    image: `${siteConfig.url}/og/default.png`,
    favicon: `${siteConfig.url}/favicon.ico`,
    copyright: `© ${new Date().getFullYear()} ${siteConfig.authorName}`,
    updated: posts[0]?.frontmatter.date ?? new Date(),
    generator: 'Next.js + feed package',
    feedLinks: {
      rss2: `${homeUrl}/feed.xml`,
      atom: `${homeUrl}/feed.xml?format=atom`,
      json: `${homeUrl}/feed.xml?format=json`,
    },
    author: {
      name: siteConfig.authorName,
      email: siteConfig.authorEmail,
      link: siteConfig.url,
    },
  })

  for (const post of posts) {
    const url = postUrl(locale, post.slug)
    feed.addItem({
      title: post.frontmatter.title,
      id: url,
      link: url,
      description: post.frontmatter.description,
      content: post.content,
      date: post.frontmatter.date,
      category: post.frontmatter.tags.map((name) => ({ name })),
      author: [
        {
          name: siteConfig.authorName,
          email: siteConfig.authorEmail,
          link: siteConfig.url,
        },
      ],
    })
  }

  return feed
}
