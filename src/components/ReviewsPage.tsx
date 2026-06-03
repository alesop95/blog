import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/i18n/routing'
import { getReviews } from '@/lib/posts'
import { Footer } from './Footer'
import { Header } from './Header'
import { PostsList } from './PostsList'

/**
 * Shared renderer for the reviews index (en `/reviews`, it `/recensioni`).
 * Lists every visible `type: "review"` post, newest first. Locale-agnostic;
 * the localized URL segment lives in the route folders and `reviewsSection`.
 */
export async function ReviewsPage({ locale }: { locale: Locale }) {
  setRequestLocale(locale)
  const t = await getTranslations()
  const reviews = await getReviews(locale)

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4 sm:px-6">
      <Header />
      <main className="flex-1 pb-24 pt-12 sm:pt-20">
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          {t('reviews.title')}
        </h1>
        <p className="mt-3 text-ink/70">{t('reviews.intro')}</p>

        {reviews.length === 0 ? (
          <p className="mt-8 font-mono text-sm text-ink/60">{t('reviews.empty')}</p>
        ) : (
          <div className="mt-8">
            <PostsList posts={reviews} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
