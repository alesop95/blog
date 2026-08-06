# ADR-009 - "Review" post type (structured header + localized index)

**Status**: Accepted · **Date**: 2026-06-03 · **Session**: #7 (Phase 4)

## Context

The blog had a first real review (`pathosfera-caparezza`, Caparezza) published as a plain post tagged `recensioni`. We want reviews to be a first-class *kind*: a structured header (artist · work · kind · year · rating · source), a dedicated index, and a listing badge - without forking the whole post pipeline. The blog spans music, books, film and audio gear, so the model must not be music-only.

## Decision

A review is a normal post with `type: "review"` in its frontmatter, plus an optional `review` metadata block. No separate content tree, no separate route for the article itself - it still lives at `/en/posts/<slug>` ↔ `/it/articoli/<slug>` and keeps all existing behaviour (TOC, OG, JSON-LD, pairing, Pagefind).

### Frontmatter contract (`src/lib/posts.ts`)

```yaml
type: review            # 'post' (default) | 'review'
review:                 # all fields optional
  artist: "Caparezza"   # artist / author
  work: "Pathosfera"    # title of the reviewed work
  kind: "brano"         # free-form, in the post's own language (album/track/book/film…)
  year: 2025            # release year
  rating: 4.5           # 0-5, half-star steps (Zod refine enforces 0.5 granularity)
  link: "https://…"     # source (YouTube / Spotify / publisher…)
```

- **All fields optional** → a review can be a reflective essay (no rating) or a full listing card. The header renders whatever is present.
- **`kind` is author-written in the post's language** and rendered verbatim - no extra i18n. Keeps it generic across music/books/film without an enum to maintain.
- **`rating` validated to half-steps** via `.refine((n) => Number.isInteger(n * 2))`.

### UI

- **`ReviewHeader`** (`src/components/ReviewHeader.tsx`) - async server component, a "spec strip" above the prose: kind · year (mono/accent), artist - work (display), half-star rating + source link. Labels from the `review` i18n namespace (`rating`, `source`). Rating stars use two layered lucide `Star` rows (muted outline + accent fill clipped to `rating/5` width) for exact half-star rendering.
- **Index** `/reviews` ↔ `/recensioni` - static localized folders (`app/[locale]/reviews`, `app/[locale]/recensioni`), each pinned per-locale via `generateStaticParams`, sharing `<ReviewsPage>` (which reuses `<PostsList>`). Same static-folder-beats-dynamic-`[section]` pattern as tags/archive (ADR-006 addendum). Helpers `reviewsSection`/`reviewsPath` in `routing.ts`.
- **Listing badge** - `<PostsList>` shows a small "Review"/"Recensione" pill when `frontmatter.type === 'review'`.
- **Footer link** to the reviews index; **sitemap** entry (index paired EN↔IT).
- **Bilingual parity (#6)** - `type: review` + the `review` block applied to *both* Caparezza twins.

## Consequences

- One frontmatter field gates everything; non-review posts are completely unaffected (`type` defaults to `post`). Backward compatible.
- The review article URL is unchanged - only the header, the index, and the badge are new.
- The `/reviews` index reuses `<PostsList>`, so review cards there also carry the redundant "Review" badge. Accepted (cheap, harmless); a dedicated rating-aware listing card can come later if wanted.
- **Open**: `rating` on the Caparezza twins is currently `4.5` as a placeholder - Alessio to confirm/adjust (it encodes his judgement, not a fact). `year: 2025` and the rest are factual (single from *Orbit Orbit*, 2025).
