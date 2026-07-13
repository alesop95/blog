import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { siteConfig } from '@/config/site'
import { LocaleSwitcher } from './LocaleSwitcher'
import { Search } from './Search'
import { ThemeToggle } from './ThemeToggle'

interface HeaderProps {
  /** If we're on a post page, pass the translation slug for the switcher. */
  translationSlug?: string | null
  /** For any other page with a deterministic other-locale path. See `LocaleSwitcher`. */
  targetPath?: string | null
}

/**
 * Sticky, blurred header. The Logo lives in the home hero, so up here we
 * keep things sparse: a small nav, the locale switcher, and the theme toggle.
 */
export function Header({ translationSlug = null, targetPath = null }: HeaderProps) {
  const t = useTranslations()

  const initials = siteConfig.name
    .split(' ')
    .map((s) => s.charAt(0))
    .join('')

  return (
    <header
      // Anchored during route view transitions so the masthead stays put while
      // the content crossfades (ADR-008; see ::view-transition-group in globals.css).
      style={{ viewTransitionName: 'site-header' }}
      className="sticky top-0 z-30 -mx-4 border-b border-ink/8 bg-paper/75 px-4 backdrop-blur-md backdrop-saturate-150 sm:-mx-6 sm:px-6"
    >
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between">
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-[0.22em] text-ink/70 transition-colors hover:text-accent"
        >
          {initials}
          <span className="mx-2 text-ink/30">/</span>
          {t('nav.home')}
        </Link>

        <nav className="flex items-center gap-1">
          <Search />
          <LocaleSwitcher translationSlug={translationSlug} targetPath={targetPath} />
          <span aria-hidden className="mx-1 h-4 w-px bg-ink/15" />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
