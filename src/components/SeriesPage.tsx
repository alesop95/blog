import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/i18n/routing'
import { getAllSeries, getSeriesPosts } from '@/lib/posts'
import { Footer } from './Footer'
import { Header } from './Header'
import { PostsList } from './PostsList'

/**
 * The series index (en `/series`, it `/serie`): every series rendered as its own
 * section — heading + the posts in reading-arc order. A single static page (no
 * per-series dynamic route), so it stays export-safe even when there are zero
 * series (output:export can't pre-render an empty dynamic route). Each section
 * has an `id` so post banners can deep-link to it (`/series#<slug>`).
 */
export async function SeriesPage({ locale }: { locale: Locale }) {
  setRequestLocale(locale)
  const t = await getTranslations()
  const series = await getAllSeries(locale)

  // Fetch each series' ordered arc in parallel.
  const arcs = await Promise.all(
    series.map(async (s) => ({ ...s, posts: await getSeriesPosts(locale, s.slug) })),
  )

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4 sm:px-6">
      <Header />
      <main id="main-content" className="flex-1 pb-24 pt-12 sm:pt-20">
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          {t('series.title')}
        </h1>
        <p className="mt-3 text-ink/70">{t('series.intro')}</p>

        {arcs.length === 0 ? (
          <p className="mt-8 font-mono text-sm text-ink/60">{t('series.empty')}</p>
        ) : (
          <div className="mt-12 space-y-14">
            {arcs.map((s) => (
              <section key={s.slug} id={s.slug} className="scroll-mt-24">
                <div className="mb-4 flex items-baseline justify-between gap-4">
                  <h2 className="font-display text-2xl font-semibold tracking-tight">
                    {s.name}
                  </h2>
                  <span className="shrink-0 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-ink/45">
                    {t('series.count', { count: s.count })}
                  </span>
                </div>
                <PostsList posts={s.posts} headingLevel={3} />
              </section>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
