import { ChevronRight } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'
import type { Post } from '@/lib/posts'
import { PostsList } from './PostsList'

/**
 * The home-page writings browser: a two-level collapsible archive built on
 * native <details>/<summary> (no client JS, export-safe). Posts arrive already
 * date-descending, so iterating preserves newest-first order at both levels.
 * Each month's leaf reuses <PostsList> so the row styling, review badge, and
 * title View Transition stay identical to the rest of the site.
 *
 * Initial state: only the most recent year is open, and within it only the most
 * recent month - so the latest writing is visible while everything else folds
 * away. Change the two `open` guards below to alter that default.
 */
export function PostsArchiveTree({ posts }: { posts: Post[] }) {
  const t = useTranslations()
  const format = useFormatter()

  if (posts.length === 0) {
    return <p className="font-mono text-sm text-ink/60">{t('home.emptyState')}</p>
  }

  // Group date-desc posts into year -> month, preserving insertion (newest-first)
  // order at both levels (Map keeps insertion order).
  const byYear = new Map<number, Map<number, Post[]>>()
  for (const post of posts) {
    const d = post.frontmatter.date
    const year = d.getFullYear()
    const month = d.getMonth()
    let months = byYear.get(year)
    if (!months) {
      months = new Map<number, Post[]>()
      byYear.set(year, months)
    }
    const bucket = months.get(month)
    if (bucket) bucket.push(post)
    else months.set(month, [post])
  }

  const years = [...byYear.entries()]

  return (
    <div className="border-t border-ink/10">
      {years.map(([year, months], yearIndex) => {
        const monthEntries = [...months.entries()]
        const yearCount = monthEntries.reduce((n, [, ps]) => n + ps.length, 0)

        return (
          <details
            key={year}
            open={yearIndex === 0}
            className="disclosure border-b border-ink/10"
          >
            <summary className="flex items-center gap-3 py-3.5">
              <ChevronRight
                className="disclosure__chev h-4 w-4 shrink-0 text-ink/45"
                aria-hidden
              />
              <span className="font-mono text-sm font-medium uppercase tracking-[0.2em] tabular-nums text-ink/85">
                {year}
              </span>
              <span className="font-mono text-[0.72rem] text-ink/55">
                {t('tags.count', { count: yearCount })}
              </span>
            </summary>

            <div className="pb-3 pl-7">
              {monthEntries.map(([month, monthPosts], monthIndex) => {
                const first = monthPosts[0]
                if (!first) return null

                return (
                  <details
                    key={month}
                    open={yearIndex === 0 && monthIndex === 0}
                    className="disclosure"
                  >
                    <summary className="flex items-center gap-3 py-2.5">
                      <ChevronRight
                        className="disclosure__chev h-3.5 w-3.5 shrink-0 text-ink/40"
                        aria-hidden
                      />
                      <span className="font-display text-base capitalize text-ink/85">
                        {format.dateTime(first.frontmatter.date, { month: 'long' })}
                      </span>
                      <span className="font-mono text-[0.72rem] text-ink/55">
                        {t('tags.count', { count: monthPosts.length })}
                      </span>
                    </summary>

                    <div className="pl-6">
                      <PostsList posts={monthPosts} headingLevel={3} />
                    </div>
                  </details>
                )
              })}
            </div>
          </details>
        )
      })}
    </div>
  )
}
