import { useTranslations } from 'next-intl'
import { siteConfig } from '@/config/site'

/**
 * Buttondown email-subscribe box. A plain HTML form that POSTs to Buttondown
 * (no JS, no client bundle) - on submit it opens Buttondown's confirmation page
 * in a new tab. Renders nothing until `siteConfig.newsletter.buttondownUser` is
 * set, so the site works untouched out of the box.
 */
export function Newsletter() {
  const t = useTranslations('newsletter')
  const user = siteConfig.newsletter.buttondownUser
  if (!user) return null

  return (
    <section className="mt-20 rounded-lg border border-ink/12 bg-ink/[0.02] px-6 py-7 print:hidden">
      <h2 className="font-display text-xl font-semibold tracking-tight">
        {t('title')}
      </h2>
      <p className="mt-2 max-w-prose text-sm text-ink/80">{t('description')}</p>
      <form
        action={`https://buttondown.com/api/emails/embed-subscribe/${user}`}
        method="post"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex flex-col gap-2 sm:flex-row"
      >
        <input
          type="email"
          name="email"
          required
          placeholder={t('placeholder')}
          aria-label={t('placeholder')}
          className="flex-1 rounded-md border border-ink/20 bg-paper px-3 py-2 text-ink outline-none placeholder:text-ink/50 focus-visible:border-accent"
        />
        <input type="hidden" name="embed" value="1" />
        <button
          type="submit"
          className="rounded-md bg-accent px-4 py-2 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-paper transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {t('subscribe')}
        </button>
      </form>
    </section>
  )
}
