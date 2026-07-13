'use client'

import type { Route } from 'next'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { type Locale, otherLocale as getOtherLocale, postPath } from '@/i18n/routing'

interface LocaleSwitcherProps {
  /**
   * For post pages, pass the slug of the translation in the OTHER locale,
   * if it exists. The switcher will navigate to that exact translation
   * instead of falling back to the home of the other locale.
   */
  translationSlug?: string | null
  /**
   * For any other page with a deterministic equivalent in the other locale
   * (tag index/page, archive, reviews, series, year, uses, now), pass that
   * path already resolved to the OTHER locale - e.g. `tagsIndexPath('en')`
   * when currently on `/it/tag`. Ignored if `translationSlug` is set.
   */
  targetPath?: string | null
}

const STORAGE_KEY = 'preferred-locale'

/**
 * IT / EN toggle.
 * • Click → writes preference to localStorage (so the root splash respects it)
 *           then navigates to the equivalent page in the other locale.
 * • On a post page with a known gemella → goes to that translation
 *   (`postPath` builds the localized URL, e.g. /it/articoli/...).
 * • On a page with a deterministic other-locale equivalent (tags, archive,
 *   reviews, series, year, uses, now) → `targetPath`, precomputed by the page.
 * • Otherwise (home, or a post without an articleId twin) → the other-locale
 *   home; a missing twin can't map to an equivalent slug (ADR-003).
 *
 * Uses the plain `next/navigation` router because post URLs are real localized
 * routes now, not next-intl `pathnames` (see ADR-006). The router applies the
 * basePath automatically.
 */
export function LocaleSwitcher({ translationSlug, targetPath }: LocaleSwitcherProps) {
  const currentLocale = useLocale() as Locale
  const t = useTranslations('locale')
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const nextLocale = getOtherLocale(currentLocale)

  const handleClick = () => {
    try {
      localStorage.setItem(STORAGE_KEY, nextLocale)
    } catch {
      // localStorage can throw in private/embedded modes - non-fatal.
    }

    const target = translationSlug
      ? postPath(nextLocale, translationSlug)
      : targetPath ?? `/${nextLocale}`
    router.replace(target as Route)
  }

  // Until mounted, render the same label as on the server (current locale)
  // to avoid a hydration mismatch.
  const visibleLabel = mounted ? t('other') : t('current')

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={t('switchLabel', { locale: nextLocale.toUpperCase() })}
      className="inline-flex h-9 min-w-9 items-center justify-center rounded-full px-2.5 font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-ink/70 transition-colors hover:bg-ink/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {visibleLabel}
    </button>
  )
}
