import type { Metadata } from 'next'
import type { ReactNode } from 'react'

/**
 * Root layout — intentionally minimal.
 *
 * Provides only the `<html>` / `<body>` shell required by Next.js.
 * Fonts, theme provider, and i18n provider live in the [locale]/layout.tsx
 * so the splash page at `/` doesn't pay for them.
 *
 * `suppressHydrationWarning` is required for the locale layout's
 * `next-themes` integration to mount without a hydration mismatch.
 */

export const metadata: Metadata = {
  title: 'Alessio Sopranzi',
}

export default function RootLayout({
  children,
}: { children: ReactNode }) {
  return (
    // Default document language; the [locale] layout sets `lang` on its wrapper
    // for localized content. The root shell needs a lang for a11y (useHtmlLang).
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
