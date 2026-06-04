import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server'
import { now } from '@/config/now'
import type { Locale } from '@/i18n/routing'
import { Footer } from './Footer'
import { Header } from './Header'

/**
 * Shared renderer for the "now" page (en `/now`, it `/ora`). A snapshot of
 * current focus; content lives in `src/config/now.ts`.
 */
export async function NowPage({ locale }: { locale: Locale }) {
  setRequestLocale(locale)
  const t = await getTranslations()
  const format = await getFormatter()
  const items = now[locale]
  const updated = new Date(now.updated)

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4 sm:px-6">
      <Header />
      <main id="main-content" className="flex-1 pb-24 pt-12 sm:pt-20">
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          {t('now.title')}
        </h1>
        <p className="mt-3 max-w-prose text-ink/80">{t('now.intro')}</p>

        <ul className="mt-10 max-w-prose space-y-4">
          {items.map((text) => (
            <li key={text} className="flex gap-3 text-lg leading-snug">
              <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span>{text}</span>
            </li>
          ))}
        </ul>

        <p className="mt-10 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-ink/70">
          {t('now.updated', {
            date: format.dateTime(updated, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
          })}
        </p>
      </main>
      <Footer />
    </div>
  )
}
