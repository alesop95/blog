import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { TagPage } from '@/components/TagPage'
import { isLocale } from '@/i18n/routing'
import { getAllTags } from '@/lib/posts'

/* EN single-tag page - `/en/tags/<tag>`. IT counterpart in `../../tag/[tag]`. */
const LOCALE = 'en' as const

export async function generateStaticParams() {
  const tags = await getAllTags(LOCALE)
  return tags.map(({ tag }) => ({ locale: LOCALE, tag }))
}

type Params = Promise<{ locale: string; tag: string }>

export async function generateMetadata({
  params,
}: { params: Params }): Promise<Metadata> {
  const { locale, tag } = await params
  if (!isLocale(locale)) return {}
  const t = await getTranslations({ locale, namespace: 'tags' })
  return { title: t('taggedTitle', { tag: decodeURIComponent(tag) }) }
}

export default async function Page({ params }: { params: Params }) {
  const { locale, tag } = await params
  if (locale !== LOCALE) notFound()
  return <TagPage locale={LOCALE} tag={decodeURIComponent(tag)} />
}
