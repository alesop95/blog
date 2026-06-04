import { ExternalLink, Star } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/i18n/routing'
import type { ReviewMeta } from '@/lib/posts'

/**
 * Structured "spec strip" for `type: "review"` posts (ADR-009). Renders above
 * the prose, below the title. Every field is optional - it shows whatever the
 * frontmatter `review` block provides (kind · year, artist - work, a half-step
 * star rating, a source link). Async server component: pulls its labels from
 * the `review` i18n namespace.
 */
export async function ReviewHeader({
  review,
  locale,
}: {
  review: ReviewMeta
  locale: Locale
}) {
  const t = await getTranslations({ locale, namespace: 'review' })

  const metaLine = [review.kind, review.year?.toString()]
    .filter(Boolean)
    .join(' · ')

  const work = review.work
  const artist = review.artist

  return (
    // A <div role="note">, not <aside>: this sits inside <article>/<main>, so a
    // complementary landmark here is not top-level (axe). It's a note about the work.
    <div
      role="note"
      className="mb-10 rounded-lg border border-ink/12 bg-ink/[0.02] px-5 py-4"
    >
      {metaLine ? (
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-accent">
          {metaLine}
        </p>
      ) : null}

      {artist || work ? (
        <p className="mt-1 font-display text-xl font-medium leading-snug">
          {artist && work ? (
            <>
              <span>{artist}</span>
              <span className="mx-2 text-ink/35">-</span>
              <span className="italic">{work}</span>
            </>
          ) : (
            <span className={work ? 'italic' : undefined}>{artist ?? work}</span>
          )}
        </p>
      ) : null}

      {(review.rating !== undefined || review.link) && (
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          {review.rating !== undefined ? (
            <Stars
              rating={review.rating}
              label={t('rating', { value: review.rating })}
            />
          ) : null}

          {review.link ? (
            <a
              href={review.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ink/60 transition-colors hover:text-accent"
            >
              {t('source')}
              <ExternalLink aria-hidden className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>
      )}
    </div>
  )
}

/**
 * Five-star rating with half-step precision. Two layered rows: a muted outline
 * row and an accent-filled row clipped to `rating/5` width - so 4.5 shows four
 * and a half filled stars exactly.
 */
function Stars({ rating, label }: { rating: number; label: string }) {
  const pct = (rating / 5) * 100
  const stars = [0, 1, 2, 3, 4]

  return (
    <span
      className="relative inline-flex shrink-0"
      role="img"
      aria-label={label}
    >
      <span className="flex text-ink/20">
        {stars.map((i) => (
          <Star key={i} aria-hidden className="h-4 w-4" />
        ))}
      </span>
      <span
        className="absolute left-0 top-0 flex h-full overflow-hidden text-accent"
        style={{ width: `${pct}%` }}
        aria-hidden
      >
        {stars.map((i) => (
          <Star key={i} className="h-4 w-4 shrink-0" fill="currentColor" />
        ))}
      </span>
    </span>
  )
}
