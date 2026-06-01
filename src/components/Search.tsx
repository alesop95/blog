'use client'

import { Search as SearchIcon, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'
import { siteConfig } from '@/config/site'

/* Minimal shape of the bits of the Pagefind runtime API we use. */
interface PagefindApi {
  search: (
    query: string,
    opts?: { filters?: Record<string, string> },
  ) => Promise<{ results: { data: () => Promise<PagefindData> }[] }>
}
interface PagefindData {
  url: string
  excerpt: string
  meta: { title?: string }
}
interface Hit {
  url: string
  title: string
  excerpt: string
}

type Status = 'idle' | 'ready' | 'unavailable'

/**
 * ⌘K / Ctrl+K full-text search backed by Pagefind (see ADR / _notes).
 *
 * Pagefind's index is generated at build into `out/pagefind/` and loaded lazily
 * in the browser — so this does nothing useful in `pnpm dev` (no index yet); it
 * degrades to an "unavailable" message. Results are scoped to the current
 * locale via the `lang` filter baked into each post at index time.
 */
export function Search() {
  const t = useTranslations('search')
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<Hit[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const pagefind = useRef<PagefindApi | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Global shortcut: ⌘K / Ctrl+K toggles, Escape closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const loadPagefind = useCallback(async (): Promise<PagefindApi | null> => {
    if (pagefind.current) return pagefind.current
    if (status === 'unavailable') return null
    try {
      const url = `${siteConfig.basePath}/pagefind/pagefind.js`
      const mod = (await import(
        /* webpackIgnore: true */ /* turbopackIgnore: true */ url
      )) as PagefindApi
      pagefind.current = mod
      setStatus('ready')
      return mod
    } catch {
      setStatus('unavailable')
      return null
    }
  }, [status])

  // Load the index + focus the input when the modal opens.
  useEffect(() => {
    if (!open) return
    loadPagefind()
    const id = setTimeout(() => inputRef.current?.focus(), 0)
    return () => clearTimeout(id)
  }, [open, loadPagefind])

  // Debounced search whenever the query changes.
  useEffect(() => {
    if (!open) return
    const q = query.trim()
    if (!q) {
      setHits([])
      return
    }
    let active = true
    const id = setTimeout(async () => {
      const pf = await loadPagefind()
      if (!pf || !active) return
      const search = await pf.search(q, { filters: { lang: locale } })
      const data = await Promise.all(
        search.results.slice(0, 8).map((r) => r.data()),
      )
      if (!active) return
      setHits(
        data.map((d) => ({
          url: `${siteConfig.basePath}${d.url}`,
          title: d.meta.title ?? d.url,
          excerpt: d.excerpt,
        })),
      )
    }, 180)
    return () => {
      active = false
      clearTimeout(id)
    }
  }, [query, open, locale, loadPagefind])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('open')}
        className="inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ink/70 transition-colors hover:bg-ink/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <SearchIcon className="h-4 w-4" aria-hidden />
        <kbd className="hidden font-sans not-italic sm:inline">⌘K</kbd>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('open')}
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[15vh]"
        >
          {/* Interactive backdrop (a real <button>, so no a11y lint): click to close.
              The panel below is `relative`, so it paints above and swallows its own clicks. */}
          <button
            type="button"
            aria-label="Close search"
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-default bg-ink/40 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-xl overflow-hidden rounded-lg border border-ink/10 bg-paper shadow-2xl">
            <div className="flex items-center gap-2 border-b border-ink/10 px-4">
              <SearchIcon className="h-4 w-4 shrink-0 text-ink/50" aria-hidden />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('placeholder')}
                className="h-12 w-full bg-transparent text-[0.95rem] text-ink outline-none placeholder:text-ink/40"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="shrink-0 rounded p-1 text-ink/50 hover:text-ink"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto">
              {status === 'unavailable' ? (
                <p className="px-4 py-6 text-sm text-ink/55">{t('unavailable')}</p>
              ) : query.trim() && hits.length === 0 ? (
                <p className="px-4 py-6 text-sm text-ink/55">{t('noResults')}</p>
              ) : (
                <ul className="divide-y divide-ink/8">
                  {hits.map((hit) => (
                    <li key={hit.url}>
                      <a
                        href={hit.url}
                        className="block px-4 py-3 transition-colors hover:bg-ink/4"
                      >
                        <span className="block font-display text-[0.95rem] font-medium text-ink">
                          {hit.title}
                        </span>
                        <span
                          className="mt-0.5 block text-[0.82rem] leading-snug text-ink/60 [&_mark]:bg-accent/20 [&_mark]:text-ink"
                          // biome-ignore lint/security/noDangerouslySetInnerHtml: Pagefind-generated excerpt with <mark> highlights
                          dangerouslySetInnerHTML={{ __html: hit.excerpt }}
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
