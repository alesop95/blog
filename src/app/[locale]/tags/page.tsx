import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { TagPage } from '@/components/TagPage'
import { isLocale } from '@/i18n/routing'

/* EN tag index - `/en/tags`. The localized IT counterpart lives in `../tag`. */
const LOCALE = 'en' as const

export function generateStaticParams() {
  return [{ locale: LOCALE }]
}

type Params = Promise<{ locale: string }>

export async function generateMetadata({
  params,
}: { params: Params }): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = await getTranslations({ locale, namespace: 'tags' })
  return { title: t('title') }
}

export default async function Page({ params }: { params: Params }) {
  const { locale } = await params
  if (locale !== LOCALE) notFound()
  return <TagPage locale={LOCALE} />
}
