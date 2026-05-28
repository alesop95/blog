'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { routing } from '@/i18n/routing'

interface LocaleSwitcherProps {
  /**
   * For post pages, pass the slug of the translation in the OTHER locale,
   * if it exists. The switcher will navigate to that exact translation
   * instead of falling back to the home of the other locale.
   */
  translationSlug?: string | null
}

const STORAGE_KEY = 'preferred-locale'

/**
 * IT / EN toggle.
 * • Click → writes preference to localStorage (so the root splash respects it)
 *           then navigates to the equivalent page in the other locale.
 * • On post pages with a known translation slug → goes to the gemella article.
 * • Otherwise → goes to the home of the other locale via next-intl's router.
 */
export function LocaleSwitcher({ translationSlug }: LocaleSwitcherProps) {
  const currentLocale = useLocale() as Locale
  const t = useTranslations('locale')
  const router = useRouter()
  const pathname = usePathname()

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const otherLocale: Locale =
    routing.locales.find((l) => l !== currentLocale) ?? routing.defaultLocale

  const handleClick = () => {
    try {
      localStorage.setItem(STORAGE_KEY, otherLocale)
    } catch {
      // localStorage can throw in private/embedded modes — non-fatal.
    }

    // On a single post page, prefer the translation if we know it.
    if (translationSlug && pathname === '/posts/[slug]') {
      router.replace(
        { pathname: '/posts/[slug]', params: { slug: translationSlug } },
        { locale: otherLocale },
      )
      return
    }

    // Otherwise navigate to the same logical pathname in the other locale.
    // A post page without a known translation (no articleId gemella) can't map
    // to an equivalent slug, so it falls back to the other-locale home (ADR-003).
    if (pathname === '/posts/[slug]') {
      router.replace('/', { locale: otherLocale })
    } else {
      router.replace(pathname, { locale: otherLocale })
    }
  }

  // Until mounted, render the same label as on the server (current locale)
  // to avoid a hydration mismatch.
  const visibleLabel = mounted ? t('other') : t('current')

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={t('switchLabel', { locale: otherLocale.toUpperCase() })}
      className="inline-flex h-9 min-w-9 items-center justify-center rounded-full px-2.5 font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-ink/70 transition-colors hover:bg-ink/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {visibleLabel}
    </button>
  )
}
