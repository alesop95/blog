# ADR-018 - Topic pages: editorial abstracts on tag pages, decoupled from posts

**Status**: Accepted · **Date**: 2026-07-13 · **Session**: #10

## Context

The CV (`my-cv`, a separate repository) lists 16 personal interests as short one-line bullets,
compacted down from full paragraph descriptions during a page-count reduction pass. The original
long-form text was archived, not lost. The idea: point the CV at this blog for the expanded
version of each interest, so the CV stays a one-page summary and the blog becomes the place where
those interests are actually explored in writing over time.

The blog currently has 6-7 posts, almost all tagged around music/audio/acoustics. Most of the 16
interests (personal finance, psychology, Linux, 3D printing, data analysis, etc.) have zero posts
today. The existing tag system (`getAllTags`/`getPostsByTag`, `/tags`↔`/tag`) only surfaces tags
that already appear on a post's frontmatter - a tag with no posts doesn't exist as a page and
isn't discoverable, so there was nowhere to put a description before the first article on that
subject gets written.

Two shapes were considered:

1. **A dedicated new content type** ("topics" as first-class pages, parallel to reviews/series) -
   its own route segment, its own index, its own frontmatter schema. Rejected: disproportionate to
   the actual need (a title + a paragraph per topic) and duplicates what tags already do
   (grouping posts by subject).
2. **Extend the existing tag pages with an optional editorial description**, sourced from a static
   config, rendered when present, with zero effect on tags that aren't curated topics. Chosen: it
   reuses `getAllTags`/`getPostsByTag`/`<PostsList>` as-is, adds one new config file and one new
   message namespace, and needs no new route.

## Decision

- **`src/config/topics.ts`**: language-neutral list of `{ id, tags: { en, it } }`. `id` is also the
  key under `topics.<id>` in `messages/{en,it}.json` (title + description - reader-facing text
  stays in the message catalogs, per the existing `site.ts` convention, not in the config file).
  `getTopicByTag(locale, tag)` looks up a topic by its locale-specific tag string;
  `topicTags(locale)` lists every topic's tag string in that locale.
- **`generateStaticParams`** in both `tags/[tag]/page.tsx` (EN) and `tag/[tag]/page.tsx` (IT) now
  unions tags discovered from posts with `topicTags(locale)`, so a topic's page exists - and is
  statically exported - even at zero posts.
- **`TagPage.tsx`**: `TagIndex` unions post-tag counts with topic tags (showing `0` for topics
  with no posts yet, instead of omitting them). `TaggedPosts` looks up the topic for the current
  tag and, if found, renders `topics.<id>.description` under the existing `h1`/count header - the
  heading structure and `<PostsList>` markup are unchanged, so this doesn't touch the a11y
  heading-order tests. When a topic has zero posts, a new `tags.noPosts` message renders instead
  of `<PostsList>`'s own generic `home.emptyState` fallback, so a curated topic reads as "not
  written yet" rather than as a broken/empty page.
- Two of the sixteen imported topics **reuse existing tags** verbatim (`music`/`musica` for
  "music theory & guitar", `songwriting`/`songwriting` for "songwriting") instead of creating
  parallel near-duplicate tags, so their descriptions attach to the posts already carrying those
  tags.
- All sixteen titles/descriptions are direct translations of the CV's archived long-form text
  (`E:\my-cv\_notes\cv-content-archive-2026-07-09.md`, not itself part of this repo or versioned
  publicly) - EN written fresh for this ADR, IT kept close to the original wording.

## Consequences

- `/tags`↔`/tag` now lists up to 16 more entries than before, most at `0` post count - an
  intentional "here's what I'll eventually write about" signal, not a bug. If that reads as too
  sparse before real content lands, the fix is to grow the union list, not to remove topics.
- No new route, no new Zod schema, no change to post frontmatter validation. Existing quality
  gates (typecheck, lint, a11y, visual snapshots) apply unchanged; verified `pnpm typecheck` +
  `pnpm lint` clean on the touched files, and `pnpm build:next` emits the expected
  `/en/tags/<topic>` and `/it/tag/<topic>` pages with the description and empty-state text present
  in the static HTML.
- Future new interests just need one entry in `topics.ts` + one message block; no code changes
  elsewhere.
- Not done in this session: writing actual posts for any of the fourteen still-empty topics, and
  the favicon change mentioned alongside this request (no new design was specified - deferred
  until Alessio picks one).
