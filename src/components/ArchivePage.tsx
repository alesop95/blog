import type { Route } from 'next'
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server'
import Link from 'next/link'
import { type Locale, postPath } from '@/i18n/routing'
import { getPostsByYear } from '@/lib/posts'
import { Footer } from './Footer'
import { Header } from './Header'

/**
 * Shared renderer for the archive routes (en `/archive`, it `/archivio`).
 * Lists every visible post grouped by year, newest first. Locale-agnostic;
 * the localized URL segment lives in the route folders and `archiveSection`.
 */
export async function ArchivePage({ locale }: { locale: Locale }) {
  setRequestLocale(locale)
  const t = await getTranslations()
  const format = await getFormatter()
  const groups = await getPostsByYear(locale)

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4 sm:px-6">
      <Header />
      <main id="main-content" className="flex-1 pb-24 pt-12 sm:pt-20">
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          {t('archive.title')}
        </h1>
        <p className="mt-3 text-ink/70">{t('archive.intro')}</p>

        {groups.length === 0 ? (
          <p className="mt-8 font-mono text-sm text-ink/60">{t('archive.empty')}</p>
        ) : (
          <div className="mt-10 space-y-12">
            {groups.map(({ year, posts }) => (
              <section key={year}>
                <h2 className="font-mono text-sm uppercase tracking-[0.2em] text-ink/70">
                  {year}
                </h2>
                <ul className="mt-3 divide-y divide-ink/10">
                  {posts.map((post) => (
                    <li key={post.slug}>
                      <Link
                        href={postPath(locale, post.slug) as Route}
                        className="group flex flex-col gap-1 py-3.5 transition-colors hover:text-accent sm:flex-row sm:items-baseline sm:gap-5"
                      >
                        <time
                          dateTime={post.frontmatter.date.toISOString()}
                          className="shrink-0 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-ink/70 tabular-nums sm:w-28"
                          suppressHydrationWarning
                        >
                          {format.dateTime(post.frontmatter.date, {
                            month: 'short',
                            day: '2-digit',
                          })}
                        </time>
                        <span className="font-display text-lg font-medium leading-snug">
                          {post.frontmatter.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
