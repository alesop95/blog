import { useTranslations } from 'next-intl'
import { siteConfig } from '@/config/site'

/**
 * Wordmark, not an icon. Set in Fraunces – the site's display serif –
 * with a tight letterspacing for a print-editorial feel.
 *
 * Rendered ONLY in the home hero (the one place the full name shows), so it is
 * plain text, not a link: linking the home page back to itself just fires a
 * redundant navigation. The "go home" link for every OTHER page is the "AS"
 * brand in the header.
 *
 * The subtitle ("writings" / "scritti") is pulled from i18n messages.
 */
export function Logo() {
  const t = useTranslations()

  return (
    <div className="inline-flex flex-col leading-none">
      <span className="font-display text-3xl font-semibold tracking-tight text-ink">
        {siteConfig.name}
      </span>
      <span className="mt-1 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-ink/60">
        {t('nav.home')}
      </span>
    </div>
  )
}
