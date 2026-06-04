import type { Route } from 'next'
import { useFormatter, useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { ViewTransition } from 'react'
import { type Locale, postPath } from '@/i18n/routing'
import type { Post } from '@/lib/posts'

interface PostsListProps {
  posts: Post[]
  /**
   * Heading level for each post title. Default 2 (index pages where the list
   * sits directly under the page h1). Pass 3 when the list follows a
   * `<SectionTitle>` (an h2), e.g. the home "Writings" section - so heading
   * levels never skip (a11y: heading-order).
   */
  headingLevel?: 2 | 3
}

/**
 * The home-page archive list. Tight, typographic, no thumbnails -
 * the title carries the post.
 */
export function PostsList({ posts, headingLevel = 2 }: PostsListProps) {
  const Heading = `h${headingLevel}` as const
  const t = useTranslations()
  const format = useFormatter()
  const locale = useLocale() as Locale

  if (posts.length === 0) {
    return (
      <p className="font-mono text-sm text-ink/60">{t('home.emptyState')}</p>
    )
  }

  return (
    <ul className="divide-y divide-ink/10">
      {posts.map((post) => (
        <li key={post.slug}>
          <Link
            href={postPath(locale, post.slug) as Route}
            className="group flex flex-col gap-1.5 py-5 transition-colors hover:text-accent sm:flex-row sm:items-baseline sm:gap-6"
          >
            <time
              dateTime={post.frontmatter.date.toISOString()}
              className="shrink-0 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-ink/70 tabular-nums sm:w-24"
              suppressHydrationWarning
            >
              {format.dateTime(post.frontmatter.date, {
                month: 'short',
                day: '2-digit',
                year: 'numeric',
              })}
            </time>

            <div className="flex-1">
              {post.frontmatter.type === 'review' ? (
                <span className="mb-1 inline-block rounded-full border border-accent/30 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-accent">
                  {t('reviews.badge')}
                </span>
              ) : null}
              {/* Shared name with the post's <h1>: the title morphs from list
                  to hero on navigation (View Transitions - ADR-008). */}
              <ViewTransition name={`post-title-${post.slug}`}>
                <Heading className="font-display text-lg font-medium leading-snug">
                  {post.frontmatter.title}
                </Heading>
              </ViewTransition>
              <p className="mt-1 text-sm text-ink/70 group-hover:text-ink/85">
                {post.frontmatter.description}
              </p>
            </div>

            <span className="shrink-0 font-mono text-[0.7rem] tabular-nums text-ink/70">
              <span className="sr-only">
                {t('post.minRead', { minutes: post.readingTime.minutes })}
              </span>
              <span aria-hidden>{post.readingTime.minutes}m</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
