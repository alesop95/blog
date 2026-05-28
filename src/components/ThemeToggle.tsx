'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const order = ['light', 'dark', 'system'] as const
type Mode = (typeof order)[number]

/**
 * Cycles light → dark → system → light. Locale-aware aria-label.
 * Renders a neutral placeholder until mounted to avoid a hydration mismatch.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const t = useTranslations('theme')

  useEffect(() => setMounted(true), [])

  const current: Mode = mounted ? ((theme as Mode) ?? 'system') : 'system'
  const next: Mode = order[(order.indexOf(current) + 1) % order.length] ?? 'system'

  const Icon =
    current === 'dark' ? Moon : current === 'light' ? Sun : Monitor

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={t('ariaLabel', {
        current: t(`modes.${current}`),
        next: t(`modes.${next}`),
      })}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink/70 transition-colors hover:bg-ink/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <Icon size={16} aria-hidden />
    </button>
  )
}
