import { defineRouting } from 'next-intl/routing'

/**
 * The shape of our i18n routing.
 *
 * `localePrefix: 'always'` means every real route has either `/en/...` or
 * `/it/...` — never a bare URL. The bare root `/` is handled by a separate
 * splash page (`src/app/page.tsx`) that redirects browser-side.
 *
 * `pathnames` localizes the URL segments themselves, not just the language.
 * So `/en/posts/foo` ↔ `/it/articoli/foo` are *the same* logical page,
 * rendered by *the same* file (`src/app/[locale]/posts/[slug]/page.tsx`).
 */

export const routing = defineRouting({
  locales: ['en', 'it'] as const,
  defaultLocale: 'en',
  localePrefix: 'always',
  pathnames: {
    '/': '/',
    '/posts/[slug]': {
      en: '/posts/[slug]',
      it: '/articoli/[slug]',
    },
    // Phase 2-B will add:
    // '/tags':       { en: '/tags',       it: '/tag' },
    // '/tags/[tag]': { en: '/tags/[tag]', it: '/tag/[tag]' },
  },
})

export type Locale = (typeof routing.locales)[number]

/** Runtime guard for unknown locale strings (e.g. from URL params). */
export function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value)
}
