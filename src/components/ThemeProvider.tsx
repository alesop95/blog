'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ComponentProps, ReactNode } from 'react'

type ThemeProviderProps = ComponentProps<typeof NextThemesProvider> & {
  children: ReactNode
}

/**
 * Thin wrapper around `next-themes` so the rest of the app can import from
 * `@/components/ThemeProvider` without caring about the underlying library.
 *
 * Uses `class` strategy → CSS reads `.dark` on <html>.
 * `suppressHydrationWarning` on <html> is required (we set it in layout.tsx).
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
