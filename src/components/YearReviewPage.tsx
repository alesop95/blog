import type { Route } from 'next'
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { type Locale, tagPath } from '@/i18n/routing'
import { getPostsByYear } from '@/lib/posts'
import { Footer } from './Footer'
import { Header } from './Header'
import { PostsList } from './PostsList'

const TOP_TAGS = 6

/**
 * Auto-generated "year in review": a summary header (count + total words) and
 * the year's recurring topics, then the posts. One page per year that has posts
 * (en `/year/[year]`, it `/anno/[year]`).
 */
export async function YearReviewPage({
  locale,
  year,
}: {
  locale: Locale
  year: number
}) {
  setRequestLocale(locale)
  const t = await getTranslations()
  const format = await getFormatter()

  const group = (await getPostsByYear(locale)).find((g) => g.year === year)
  if (!group) notFound()
  const { posts } = group

  const words = posts.reduce((sum, p) => sum + p.readingTime.words, 0)

  // Most-used tags across the year's posts.
  const tagCounts = new Map<string, number>()
  for (const p of posts) {
    for (const tag of p.frontmatter.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
    }
  }
  const topTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, TOP_TAGS)
    .map(([tag]) => tag)

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4 sm:px-6">
      <Header />
      <main id="main-content" className="flex-1 pb-24 pt-12 sm:pt-20">
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          {t('year.title', { year })}
        </h1>
        <p className="mt-3 text-ink/70">{t('year.intro', { year })}</p>
        <p className="mt-4 font-mono text-[0.8rem] uppercase tracking-[0.18em] text-ink/55">
          {t('year.summary', { count: posts.length, words: format.number(words) })}
        </p>

        {topTags.length > 0 ? (
          <section className="mt-8">
            <h2 className="font-mono text-xs uppercase tracking-[0.24em] text-ink/60">
              {t('year.topTags')}
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {topTags.map((tag) => (
                <li key={tag}>
                  <Link
                    href={tagPath(locale, tag) as Route}
                    className="inline-block rounded-full border border-ink/12 px-3 py-1 font-mono text-[0.72rem] text-ink/70 transition-colors hover:border-accent/40 hover:text-accent"
                  >
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-10">
          <PostsList posts={posts} />
        </section>
      </main>
      <Footer />
    </div>
  )
}
