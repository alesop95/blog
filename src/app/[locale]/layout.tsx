import type { Metadata, Viewport } from 'next'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { Fraunces, Inter_Tight, JetBrains_Mono } from 'next/font/google'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { ThemeProvider } from '@/components/ThemeProvider'
import { siteConfig } from '@/config/site'
import { routing } from '@/i18n/routing'
import './globals.css'

/* -------------------------------------------------------------------------- */
/*  Self-hosted fonts via next/font/google                                    */
/*  These are loaded only for locale-prefixed pages (not the root splash).    */
/* -------------------------------------------------------------------------- */

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
  axes: ['opsz'],
})

const interTight = Inter_Tight({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter-tight',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains',
})

/* -------------------------------------------------------------------------- */
/*  Static params for the [locale] segment                                    */
/* -------------------------------------------------------------------------- */

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

/* -------------------------------------------------------------------------- */
/*  Metadata (per locale)                                                     */
/* -------------------------------------------------------------------------- */

type Params = Promise<{ locale: string }>

export async function generateMetadata({
  params,
}: { params: Params }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'site' })
  const localTitle =
    locale === 'it' ? `${siteConfig.name} – scritti` : `${siteConfig.name} – writings`

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: localTitle,
      template: `%s – ${siteConfig.name}`,
    },
    description: t('description'),
    authors: [{ name: siteConfig.authorName }],
    creator: siteConfig.authorName,
    openGraph: {
      type: 'website',
      locale,
      url: `${siteConfig.url}/${locale}`,
      siteName: siteConfig.name,
      description: t('description'),
      // Absolute URL: Next does NOT apply basePath to metadata, and a bare
      // `/og/...` resolved against metadataBase would drop `/blog`. See ADR-004.
      images: [
        { url: `${siteConfig.url}${siteConfig.ogImage}`, width: 1200, height: 630 },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      description: t('description'),
      images: [`${siteConfig.url}${siteConfig.ogImage}`],
    },
    // All alternates are absolute on purpose – see the openGraph note above.
    alternates: {
      canonical: `${siteConfig.url}/${locale}`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `${siteConfig.url}/${l}`]),
      ),
      types: { 'application/rss+xml': `${siteConfig.url}/${locale}/feed.xml` },
    },
    robots: { index: true, follow: true },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbf9f5' },
    { media: '(prefers-color-scheme: dark)', color: '#1d1c1a' },
  ],
  width: 'device-width',
  initialScale: 1,
}

/* -------------------------------------------------------------------------- */
/*  Locale layout – wraps in fonts + theme + i18n providers.                  */
/*  Does NOT render <html>/<body> – that lives in the root layout.            */
/* -------------------------------------------------------------------------- */

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Params
}) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <div
      lang={locale}
      className={`${fraunces.variable} ${interTight.variable} ${jetbrains.variable} min-h-dvh antialiased`}
    >
      <NextIntlClientProvider messages={messages}>
        <ThemeProvider>{children}</ThemeProvider>
      </NextIntlClientProvider>
    </div>
  )
}
