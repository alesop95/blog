import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { YearReviewPage } from '@/components/YearReviewPage'
import { isLocale } from '@/i18n/routing'
import { getPostsByYear } from '@/lib/posts'

/* EN year-in-review — `/en/year/[year]`. Localized IT counterpart in `../../anno`. */
const LOCALE = 'en' as const

export const dynamicParams = false

export async function generateStaticParams() {
  const years = await getPostsByYear(LOCALE)
  return years.map((g) => ({ locale: LOCALE, year: String(g.year) }))
}

type Params = Promise<{ locale: string; year: string }>

export async function generateMetadata({
  params,
}: { params: Params }): Promise<Metadata> {
  const { locale, year } = await params
  if (!isLocale(locale)) return {}
  const t = await getTranslations({ locale, namespace: 'year' })
  return { title: t('title', { year }) }
}

export default async function Page({ params }: { params: Params }) {
  const { locale, year } = await params
  if (locale !== LOCALE) notFound()
  const n = Number(year)
  if (!Number.isInteger(n)) notFound()
  return <YearReviewPage locale={LOCALE} year={n} />
}
