import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { siteConfig } from '@/config/site'

/**
 * Wordmark, not an icon. Set in Fraunces – the site's display serif –
 * with a tight letterspacing for a print-editorial feel.
 *
 * The subtitle ("writings" / "scritti") is pulled from i18n messages.
 */
export function Logo() {
  const t = useTranslations()

  return (
    <Link
      href="/"
      className="group inline-flex flex-col leading-none"
      aria-label={`${siteConfig.name} – ${t('nav.home')}`}
    >
      <span className="font-display text-3xl font-semibold tracking-tight text-ink transition-colors group-hover:text-accent">
        {siteConfig.name}
      </span>
      <span className="mt-1 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-ink/60">
        {t('nav.home')}
      </span>
    </Link>
  )
}
