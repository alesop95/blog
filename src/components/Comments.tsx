'use client'

import { useLocale } from 'next-intl'
import { useTheme } from 'next-themes'
import { useEffect, useRef } from 'react'
import { siteConfig } from '@/config/site'

/**
 * Giscus comments (GitHub Discussions), loaded client-side. Renders nothing
 * until configured in `siteConfig.comments` (repo + repoId + categoryId), so the
 * site works untouched out of the box. The widget's theme follows next-themes:
 * the script is injected once, then theme changes are pushed via postMessage.
 * Carries `data-pagefind-ignore` so comments never pollute the search index.
 */
export function Comments() {
  const ref = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()
  const locale = useLocale()
  const c = siteConfig.comments
  const enabled = Boolean(c.repo && c.repoId && c.categoryId)

  useEffect(() => {
    if (!enabled || !ref.current) return
    const theme = resolvedTheme === 'dark' ? 'dark' : 'light'

    // Already mounted: just retheme the existing iframe.
    const frame = ref.current.querySelector<HTMLIFrameElement>('iframe.giscus-frame')
    if (frame) {
      frame.contentWindow?.postMessage(
        { giscus: { setConfig: { theme } } },
        'https://giscus.app',
      )
      return
    }

    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.async = true
    script.crossOrigin = 'anonymous'
    const attrs: Record<string, string> = {
      'data-repo': c.repo,
      'data-repo-id': c.repoId,
      'data-category': c.category,
      'data-category-id': c.categoryId,
      'data-mapping': c.mapping,
      'data-strict': '1',
      'data-reactions-enabled': '1',
      'data-emit-metadata': '0',
      'data-input-position': 'top',
      'data-theme': theme,
      'data-lang': locale,
    }
    for (const [k, v] of Object.entries(attrs)) script.setAttribute(k, v)
    ref.current.appendChild(script)
  }, [enabled, resolvedTheme, locale, c])

  if (!enabled) return null
  return (
    <section data-pagefind-ignore aria-label="Comments" className="mt-16">
      <div ref={ref} />
    </section>
  )
}
