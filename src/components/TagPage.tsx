import type { Route } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import Link from 'next/link'
import { getTopicByTag, topics } from '@/config/topics'
import { type Locale, otherLocale, tagPath, tagsIndexPath } from '@/i18n/routing'
import { getAllTags, getPostsByTag } from '@/lib/posts'
import { Footer } from './Footer'
import { Header } from './Header'
import { PostsList } from './PostsList'

/**
 * Shared renderer for the tag routes. Two modes:
 *  • no `tag`  → the tag index (every tag with its post count)
 *  • a `tag`   → the posts carrying that tag (reuses <PostsList>)
 *
 * The localized URL segment (en `tags` / it `tag`) lives in the route folders
 * and in `tagSection`; this component is locale-agnostic. See ADR-006.
 */
export async function TagPage({
  locale,
  tag,
}: {
  locale: Locale
  tag?: string
}) {
  setRequestLocale(locale)
  const t = await getTranslations()
  const targetLocale = otherLocale(locale)
  // The index always maps 1:1. A specific tag maps 1:1 only if it's a
  // registered topic (ADR-018) - an arbitrary organic tag (e.g. "acoustics",
  // with no IT/EN pair recorded anywhere) falls back to the other locale's
  // tag index rather than a guess, or the bare home for the index case itself.
  const topic = tag ? getTopicByTag(locale, tag) : undefined
  const targetPath = tag
    ? topic
      ? tagPath(targetLocale, topic.tags[targetLocale])
      : tagsIndexPath(targetLocale)
    : tagsIndexPath(targetLocale)

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4 sm:px-6">
      <Header targetPath={targetPath} />
      <main id="main-content" className="flex-1 pb-24 pt-12 sm:pt-20">
        {tag ? (
          <TaggedPosts locale={locale} tag={tag} t={t} topic={topic} />
        ) : (
          <TagIndex locale={locale} t={t} />
        )}
      </main>
      <Footer />
    </div>
  )
}

type T = Awaited<ReturnType<typeof getTranslations>>

async function TagIndex({ locale, t }: { locale: Locale; t: T }) {
  const postTags = await getAllTags(locale)
  const counts = new Map(postTags.map(({ tag, count }) => [tag, count]))
  // Union with configured topics (ADR-018): a topic is browsable at 0 posts too.
  for (const topic of topics) {
    const tag = topic.tags[locale]
    if (!counts.has(tag)) counts.set(tag, 0)
  }
  const tags = [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))

  return (
    <section>
      <h1 className="font-display text-4xl font-semibold tracking-tight">
        {t('tags.title')}
      </h1>
      <p className="mt-3 text-ink/70">{t('tags.intro')}</p>

      {tags.length === 0 ? (
        <p className="mt-8 font-mono text-sm text-ink/60">{t('tags.empty')}</p>
      ) : (
        <ul className="mt-8 flex flex-wrap gap-3">
          {tags.map(({ tag, count }) => (
            <li key={tag}>
              <Link
                href={tagPath(locale, tag) as Route}
                className="inline-flex items-baseline gap-2 rounded-full border border-ink/12 px-4 py-1.5 transition-colors hover:border-accent/40 hover:text-accent"
              >
                <span>{tag}</span>
                <span className="font-mono text-[0.7rem] tabular-nums text-ink/70">
                  {count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

async function TaggedPosts({
  locale,
  tag,
  t,
  topic,
}: {
  locale: Locale
  tag: string
  t: T
  topic: ReturnType<typeof getTopicByTag>
}) {
  const posts = await getPostsByTag(locale, tag)

  return (
    <>
      <header className="mb-10">
        <Link
          href={tagsIndexPath(locale) as Route}
          className="inline-block font-mono text-[0.72rem] uppercase tracking-[0.18em] text-ink/70 transition-colors hover:text-accent"
        >
          ← {t('tags.all')}
        </Link>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
          {t('tags.taggedTitle', { tag })}
        </h1>
        {topic && (
          <p className="mt-4 max-w-2xl text-ink/80">
            {t(`topics.${topic.id}.description`)}
          </p>
        )}
        <p className="mt-2 font-mono text-[0.8rem] text-ink/70">
          {t('tags.count', { count: posts.length })}
        </p>
      </header>
      {posts.length === 0 ? (
        <p className="font-mono text-sm text-ink/60">{t('tags.noPosts')}</p>
      ) : (
        <PostsList posts={posts} />
      )}
    </>
  )
}
