import { useTranslations } from 'next-intl'

/**
 * "Skip to content" link — the first focusable element on every page (rendered
 * in the locale layout before the header). Visually hidden until focused, so
 * keyboard users can jump past the masthead straight to `#main-content`.
 */
export function SkipLink() {
  const t = useTranslations('a11y')
  return (
    <a
      href="#main-content"
      className="sr-only rounded-md bg-paper px-4 py-2 text-ink shadow-lg outline-2 outline-accent focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60]"
    >
      {t('skipToContent')}
    </a>
  )
}
