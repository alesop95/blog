import { useFormatter, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import type { Post } from '@/lib/posts'

interface PostsListProps {
  posts: Post[]
}

/**
 * The home-page archive list. Tight, typographic, no thumbnails –
 * the title carries the post.
 */
export function PostsList({ posts }: PostsListProps) {
  const t = useTranslations()
  const format = useFormatter()

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
            href={{ pathname: '/posts/[slug]', params: { slug: post.slug } }}
            className="group flex flex-col gap-1.5 py-5 transition-colors hover:text-accent sm:flex-row sm:items-baseline sm:gap-6"
          >
            <time
              dateTime={post.frontmatter.date.toISOString()}
              className="shrink-0 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-ink/55 sm:w-24"
              suppressHydrationWarning
            >
              {format.dateTime(post.frontmatter.date, {
                month: 'short',
                day: '2-digit',
                year: 'numeric',
              })}
            </time>

            <div className="flex-1">
              <h3 className="font-display text-lg font-medium leading-snug">
                {post.frontmatter.title}
              </h3>
              <p className="mt-1 text-sm text-ink/70 group-hover:text-ink/85">
                {post.frontmatter.description}
              </p>
            </div>

            <span className="shrink-0 font-mono text-[0.7rem] tabular-nums text-ink/45">
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
