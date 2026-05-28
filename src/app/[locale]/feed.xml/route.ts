import { notFound } from 'next/navigation'
import { buildFeed } from '@/lib/feed'
import { isLocale, routing } from '@/i18n/routing'

// Force static rendering — the feed is rebuilt with the rest of the site.
export const dynamic = 'force-static'

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

type Params = Promise<{ locale: string }>

export async function GET(
  request: Request,
  { params }: { params: Params },
) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const format = new URL(request.url).searchParams.get('format')
  const feed = await buildFeed(locale)

  switch (format) {
    case 'atom':
      return new Response(feed.atom1(), {
        headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
      })
    case 'json':
      return new Response(feed.json1(), {
        headers: { 'Content-Type': 'application/feed+json; charset=utf-8' },
      })
    default:
      return new Response(feed.rss2(), {
        headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
      })
  }
}
