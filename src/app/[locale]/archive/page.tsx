import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { ArchivePage } from '@/components/ArchivePage'
import { isLocale } from '@/i18n/routing'

/* EN archive - `/en/archive`. The localized IT counterpart lives in `../archivio`. */
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
  const t = await getTranslations({ locale, namespace: 'archive' })
  return { title: t('title') }
}

export default async function Page({ params }: { params: Params }) {
  const { locale } = await params
  if (locale !== LOCALE) notFound()
  return <ArchivePage locale={LOCALE} />
}
