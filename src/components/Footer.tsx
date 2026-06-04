import type { Route } from 'next'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { siteConfig } from '@/config/site'
import {
  type Locale,
  archivePath,
  nowPath,
  reviewsPath,
  seriesIndexPath,
  tagsIndexPath,
  usesPath,
} from '@/i18n/routing'

export function Footer() {
  const t = useTranslations()
  const locale = useLocale() as Locale
  const year = new Date().getFullYear()

  return (
    <footer className="mt-12 border-t border-ink/10 pb-10 pt-8 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-ink/70">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <p>{t('footer.copyright', { year })}</p>
        <ul className="flex gap-5">
          <li>
            <Link
              href={tagsIndexPath(locale) as Route}
              className="transition-colors hover:text-accent"
            >
              {t('tags.title')}
            </Link>
          </li>
          <li>
            <Link
              href={reviewsPath(locale) as Route}
              className="transition-colors hover:text-accent"
            >
              {t('reviews.title')}
            </Link>
          </li>
          <li>
            <Link
              href={seriesIndexPath(locale) as Route}
              className="transition-colors hover:text-accent"
            >
              {t('series.title')}
            </Link>
          </li>
          <li>
            <Link
              href={archivePath(locale) as Route}
              className="transition-colors hover:text-accent"
            >
              {t('archive.title')}
            </Link>
          </li>
          <li>
            <Link
              href={usesPath(locale) as Route}
              className="transition-colors hover:text-accent"
            >
              {t('uses.title')}
            </Link>
          </li>
          <li>
            <Link
              href={nowPath(locale) as Route}
              className="transition-colors hover:text-accent"
            >
              {t('now.title')}
            </Link>
          </li>
          <li>
            <a
              // Plain anchor (feed.xml is a route handler, not in routing.pathnames),
              // so basePath isn't applied automatically - prefix it manually.
              href={`${siteConfig.basePath}/${locale}/feed.xml`}
              className="transition-colors hover:text-accent"
            >
              {t('footer.rss')}
            </a>
          </li>
        </ul>
      </div>
      <p className="mt-4 text-[0.68rem] normal-case tracking-normal text-ink/70">
        {t('footer.credit')}
      </p>
    </footer>
  )
}
