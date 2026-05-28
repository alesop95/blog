import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

/**
 * Per-request i18n configuration. Loaded by the next-intl plugin
 * (see `next.config.mjs`) and consumed by Server Components via
 * `getTranslations()` / `useTranslations()`.
 *
 * Falls back to the default locale if the URL segment is unknown.
 */

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: 'Europe/Rome',
    now: new Date(),
  }
})
