import { getTranslations, setRequestLocale } from 'next-intl/server'
import { uses } from '@/config/uses'
import { type Locale, otherLocale, usesPath } from '@/i18n/routing'
import { Footer } from './Footer'
import { Header } from './Header'

/**
 * Shared renderer for the "uses" page (en `/uses`, it `/strumenti`). Gear &
 * software grouped by category; content lives in `src/config/uses.ts`.
 */
export async function UsesPage({ locale }: { locale: Locale }) {
  setRequestLocale(locale)
  const t = await getTranslations()
  const groups = uses[locale]

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4 sm:px-6">
      <Header targetPath={usesPath(otherLocale(locale))} />
      <main id="main-content" className="flex-1 pb-24 pt-12 sm:pt-20">
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          {t('uses.title')}
        </h1>
        <p className="mt-3 max-w-prose text-ink/80">{t('uses.intro')}</p>

        <div className="mt-12 space-y-12">
          {groups.map((group) => (
            <section key={group.category}>
              <h2 className="font-mono text-sm uppercase tracking-[0.2em] text-ink/70">
                {group.category}
              </h2>
              <ul className="mt-3 divide-y divide-ink/10">
                {group.items.map((item) => (
                  <li
                    key={item.name}
                    className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-baseline sm:gap-4"
                  >
                    <span className="font-display text-lg font-medium sm:w-60 sm:shrink-0">
                      {item.name}
                    </span>
                    {item.note ? (
                      <span className="text-sm text-ink/70">{item.note}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
