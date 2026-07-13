import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { TagPage } from '@/components/TagPage'
import { topicTags } from '@/config/topics'
import { isLocale } from '@/i18n/routing'
import { getAllTags } from '@/lib/posts'

/* EN single-tag page - `/en/tags/<tag>`. IT counterpart in `../../tag/[tag]`. */
const LOCALE = 'en' as const

/**
 * Union of tags actually used by posts and tags declared as topics (ADR-018):
 * a topic gets a static page - with its editorial description and an empty
 * state - before any post carries it.
 */
export async function generateStaticParams() {
  const postTags = await getAllTags(LOCALE)
  const allTags = new Set([...postTags.map(({ tag }) => tag), ...topicTags(LOCALE)])
  return [...allTags].map((tag) => ({ locale: LOCALE, tag }))
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
