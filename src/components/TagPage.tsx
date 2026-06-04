import type { Route } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import Link from 'next/link'
import { type Locale, tagPath, tagsIndexPath } from '@/i18n/routing'
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

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4 sm:px-6">
      <Header />
      <main id="main-content" className="flex-1 pb-24 pt-12 sm:pt-20">
        {tag ? (
          <TaggedPosts locale={locale} tag={tag} t={t} />
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
  const tags = await getAllTags(locale)

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
}: {
  locale: Locale
  tag: string
  t: T
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
        <p className="mt-2 font-mono text-[0.8rem] text-ink/70">
          {t('tags.count', { count: posts.length })}
        </p>
      </header>
      <PostsList posts={posts} />
    </>
  )
}
