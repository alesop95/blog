import { describe, expect, it } from 'vitest'
import {
  PostFrontmatterSchema,
  getAllPosts,
  getAllTags,
  getPostBySlug,
  getReviews,
  getTranslation,
} from './posts'

/* -------------------------------------------------------------------------- */
/*  Frontmatter schema — the contract that fails the build on bad input.      */
/* -------------------------------------------------------------------------- */

describe('PostFrontmatterSchema', () => {
  const base = {
    title: 'Hello',
    description: 'A short description.',
    date: '2026-05-27',
  }

  it('accepts a minimal valid frontmatter and applies defaults', () => {
    const r = PostFrontmatterSchema.safeParse(base)
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.tags).toEqual([])
      expect(r.data.draft).toBe(false)
      expect(r.data.dropCap).toBe(false)
      expect(r.data.type).toBe('post')
      expect(r.data.date).toBeInstanceOf(Date)
    }
  })

  it('requires a non-empty title', () => {
    expect(PostFrontmatterSchema.safeParse({ ...base, title: '' }).success).toBe(false)
    const { title: _omit, ...noTitle } = base
    expect(PostFrontmatterSchema.safeParse(noTitle).success).toBe(false)
  })

  it('rejects a description longer than 280 chars', () => {
    expect(
      PostFrontmatterSchema.safeParse({ ...base, description: 'x'.repeat(281) })
        .success,
    ).toBe(false)
  })

  it('coerces a string date and rejects garbage dates', () => {
    const ok = PostFrontmatterSchema.safeParse(base)
    expect(ok.success && ok.data.date.getUTCFullYear()).toBe(2026)
    expect(PostFrontmatterSchema.safeParse({ ...base, date: 'not-a-date' }).success).toBe(
      false,
    )
  })

  it('only allows known post types', () => {
    expect(PostFrontmatterSchema.safeParse({ ...base, type: 'review' }).success).toBe(true)
    expect(PostFrontmatterSchema.safeParse({ ...base, type: 'note' }).success).toBe(false)
  })

  describe('review block', () => {
    const review = (extra: Record<string, unknown>) =>
      PostFrontmatterSchema.safeParse({ ...base, type: 'review', review: extra })

    it('accepts full valid review metadata', () => {
      const r = review({
        artist: 'Caparezza',
        work: 'Pathosfera',
        kind: 'brano',
        year: 2025,
        rating: 4.5,
        link: 'https://example.com/x',
      })
      expect(r.success).toBe(true)
    })

    it('accepts half-star ratings and rejects finer or out-of-range ones', () => {
      expect(review({ rating: 0 }).success).toBe(true)
      expect(review({ rating: 5 }).success).toBe(true)
      expect(review({ rating: 3.5 }).success).toBe(true)
      expect(review({ rating: 4.25 }).success).toBe(false) // not a 0.5 step
      expect(review({ rating: 5.5 }).success).toBe(false) // > 5
      expect(review({ rating: -1 }).success).toBe(false) // < 0
    })

    it('rejects a non-URL source link', () => {
      expect(review({ link: 'not a url' }).success).toBe(false)
    })

    it('coerces a numeric-string year', () => {
      const r = review({ year: '2025' })
      expect(r.success && r.data.review?.year).toBe(2025)
    })
  })
})

/* -------------------------------------------------------------------------- */
/*  Public helpers against the real content (invariants, not brittle counts). */
/* -------------------------------------------------------------------------- */

describe('post collection helpers', () => {
  it('returns posts sorted newest-first', async () => {
    const posts = await getAllPosts('en')
    expect(posts.length).toBeGreaterThan(0)
    for (let i = 1; i < posts.length; i++) {
      const prev = posts[i - 1]
      const cur = posts[i]
      if (!prev || !cur) continue
      expect(prev.frontmatter.date.getTime()).toBeGreaterThanOrEqual(
        cur.frontmatter.date.getTime(),
      )
    }
  })

  it('getReviews returns only review-type posts', async () => {
    const reviews = await getReviews('it')
    expect(reviews.length).toBeGreaterThan(0)
    expect(reviews.every((p) => p.frontmatter.type === 'review')).toBe(true)
  })

  it('getAllTags is sorted by count desc, then alphabetically', async () => {
    const tags = await getAllTags('en')
    for (let i = 1; i < tags.length; i++) {
      const prev = tags[i - 1]
      const cur = tags[i]
      if (!prev || !cur) continue
      const ordered =
        prev.count > cur.count ||
        (prev.count === cur.count && prev.tag.localeCompare(cur.tag) <= 0)
      expect(ordered).toBe(true)
    }
  })

  it('pairs translations across locales via articleId', async () => {
    const en = await getPostBySlug('en', 'hello-workshop')
    expect(en).not.toBeNull()
    const twin = en ? await getTranslation(en) : null
    expect(twin?.locale).toBe('it')
    expect(twin?.frontmatter.articleId).toBe(en?.frontmatter.articleId)
  })
})
