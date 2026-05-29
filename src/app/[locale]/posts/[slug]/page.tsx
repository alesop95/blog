import 'katex/dist/katex.min.css'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { notFound } from 'next/navigation'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { mdxComponents } from '@/components/MDXComponents'
import { SectionTitle } from '@/components/SectionTitle'
import { Toc } from '@/components/Toc'
import { siteConfig } from '@/config/site'
import { Link } from '@/i18n/navigation'
import { isLocale, routing } from '@/i18n/routing'
import { mdxOptions } from '@/lib/mdx'
import {
  getAdjacentPosts,
  getAllSlugs,
  getPostBySlug,
  getTranslation,
} from '@/lib/posts'
import { extractToc } from '@/lib/toc'

/** Posts longer than this (in words) get an auto-generated Table of Contents. */
const TOC_MIN_WORDS = 1500

/* -------------------------------------------------------------------------- */
/*  Static generation                                                         */
/* -------------------------------------------------------------------------- */

export async function generateStaticParams() {
  const pairs = await Promise.all(
    routing.locales.map(async (locale) => {
      const slugs = await getAllSlugs(locale)
      return slugs.map((slug) => ({ locale, slug }))
    }),
  )
  return pairs.flat()
}

/* -------------------------------------------------------------------------- */
/*  Per-post metadata                                                         */
/* -------------------------------------------------------------------------- */

type Params = Promise<{ locale: string; slug: string }>

export async function generateMetadata({
  params,
}: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  const post = await getPostBySlug(locale, slug)
  if (!post) return {}

  const pathnames = routing.pathnames['/posts/[slug]']
  const localized =
    typeof pathnames === 'string' ? pathnames : pathnames[locale]
  const path = `/${locale}${localized.replace('[slug]', slug)}`
  const url = `${siteConfig.url}${path}`
  const ogImage = `${siteConfig.url}/og/${locale}/${slug}.png`

  const translation = await getTranslation(post)
  // Absolute URLs: Next does NOT apply basePath to metadata, so a root-relative
  // path resolved against metadataBase would drop `/blog`. See ADR-004.
  const languages: Record<string, string> = { [locale]: url }
  if (translation) {
    const otherPathnames = routing.pathnames['/posts/[slug]']
    const otherLocalized =
      typeof otherPathnames === 'string'
        ? otherPathnames
        : otherPathnames[translation.locale]
    languages[translation.locale] =
      `${siteConfig.url}/${translation.locale}${otherLocalized.replace('[slug]', translation.slug)}`
  }

  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    alternates: { canonical: url, languages },
    openGraph: {
      type: 'article',
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      url,
      locale,
      publishedTime: post.frontmatter.date.toISOString(),
      modifiedTime: post.frontmatter.updated?.toISOString(),
      tags: post.frontmatter.tags,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      images: [ogImage],
    },
  }
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default async function PostPage({ params }: { params: Params }) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  setRequestLocale(locale)

  const post = await getPostBySlug(locale, slug)
  if (!post) notFound()

  const t = await getTranslations()
  const format = await getFormatter()
  const { previous, next } = await getAdjacentPosts(locale, slug)
  const translation = await getTranslation(post)
  const f = post.frontmatter

  const toc = extractToc(post.content)
  const showToc = post.readingTime.words > TOC_MIN_WORDS && toc.length >= 3

  // Absolute URLs (include basePath via siteConfig.url) – see ADR-004.
  const postUrl = `${siteConfig.url}/${locale}/${locale === 'it' ? 'articoli' : 'posts'}/${slug}`
  const ogImage = `${siteConfig.url}/og/${locale}/${slug}.png`
  const person = {
    '@type': 'Person',
    name: siteConfig.authorName,
    url: siteConfig.url,
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: f.title,
    description: f.description,
    datePublished: f.date.toISOString(),
    dateModified: (f.updated ?? f.date).toISOString(),
    inLanguage: locale,
    author: person,
    publisher: person,
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
    image: ogImage,
    url: postUrl,
    wordCount: post.readingTime.words,
    keywords: f.tags,
    // Declare the EN↔IT pair as translations of one another (via articleId).
    ...(translation
      ? {
          translationOfWork: {
            '@type': 'BlogPosting',
            name: translation.frontmatter.title,
            inLanguage: translation.locale,
            url: `${siteConfig.url}/${translation.locale}/${translation.locale === 'it' ? 'articoli' : 'posts'}/${translation.slug}`,
          },
        }
      : {}),
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4 sm:px-6">
      <Header translationSlug={translation?.slug ?? null} />

      <main className="flex-1 pb-24 pt-12 sm:pt-20">
        <article>
          <script
            type="application/ld+json"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: structured data
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />

          <header className="mb-10">
            <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-ink/55">
              <time dateTime={f.date.toISOString()} suppressHydrationWarning>
                {format.dateTime(f.date, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              <span aria-hidden>·</span>
              <span>{t('post.minRead', { minutes: post.readingTime.minutes })}</span>
              {f.tags.length > 0 ? (
                <>
                  <span aria-hidden>·</span>
                  <ul className="flex flex-wrap gap-2">
                    {f.tags.map((tag) => (
                      <li key={tag}>#{tag}</li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>

            <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              {f.title}
            </h1>

            <p className="mt-4 max-w-prose font-display text-lg italic text-ink/70">
              {f.description}
            </p>
          </header>

          {showToc ? <Toc entries={toc} label={t('post.contents')} /> : null}

          <div className="prose">
            <MDXRemote
              source={post.content}
              components={mdxComponents}
              options={mdxOptions}
            />
          </div>

          {(previous || next) && (
            <nav className="mt-20" aria-label="Adjacent posts">
              <SectionTitle>{t('post.sectionMoreWritings')}</SectionTitle>
              <div className="grid gap-6 sm:grid-cols-2">
                {previous ? (
                  <AdjacentLink
                    direction={t('post.previous')}
                    slug={previous.slug}
                    title={previous.frontmatter.title}
                  />
                ) : (
                  <span aria-hidden />
                )}
                {next ? (
                  <AdjacentLink
                    direction={t('post.next')}
                    slug={next.slug}
                    title={next.frontmatter.title}
                    align="right"
                  />
                ) : null}
              </div>
            </nav>
          )}
        </article>
      </main>

      <Footer />
    </div>
  )
}

function AdjacentLink({
  direction,
  slug,
  title,
  align = 'left',
}: {
  direction: string
  slug: string
  title: string
  align?: 'left' | 'right'
}) {
  const isRight = align === 'right'
  const Chevron = isRight ? ChevronRight : ChevronLeft

  return (
    <Link
      href={{ pathname: '/posts/[slug]', params: { slug } }}
      aria-label={`${direction}: ${title}`}
      className={`group block rounded-md border border-ink/10 p-5 transition-colors hover:border-accent/40 ${
        isRight ? 'sm:text-right' : ''
      }`}
    >
      <span
        className={`flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-ink/55 ${
          isRight ? 'sm:justify-end' : ''
        }`}
      >
        {!isRight && <Chevron className="h-3.5 w-3.5" aria-hidden />}
        {direction}
        {isRight && <Chevron className="h-3.5 w-3.5" aria-hidden />}
      </span>
      <h3 className="mt-2 font-display text-base font-medium leading-snug group-hover:text-accent">
        {title}
      </h3>
    </Link>
  )
}
