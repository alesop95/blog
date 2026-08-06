# ADR-019 - Locale switcher: deterministic target paths beyond posts

**Status**: Accepted · **Date**: 2026-07-13 · **Session**: #10

## Context

`LocaleSwitcher` only ever computed a real equivalent page in the other locale for a single post (`translationSlug` → `postPath`). Every other page - the tag index, a single tag page (including the new topic pages from ADR-018), archive, reviews, series, year-in-review, uses, now - passed nothing, so clicking the switcher on any of them landed on the other locale's bare home. Reported directly: on `/it/tag/` (the tag index), clicking "EN" went to `/en/` instead of `/en/tags`.

All of those pages are static, locale-paired index/detail pages with a deterministic other-locale path already computable from existing helpers in `src/i18n/routing.ts` (`archivePath`, `reviewsPath`, `seriesIndexPath`, `usesPath`, `nowPath`, `tagsIndexPath`, `yearPath`) - the switcher just never received it.

## Decision

- **`otherLocale(locale)`** added to `src/i18n/routing.ts` - the one other locale, given two.
- **`LocaleSwitcher`** gains a `targetPath?: string | null` prop. Priority order: `translationSlug` (post) → `targetPath` → bare other-locale home (unchanged fallback).
- **`Header`** forwards a new `targetPath` prop to the switcher.
- Every page component that renders `<Header>` now computes and passes its own other-locale path, server-side, using the helper already matching its route:
  - `ArchivePage` → `archivePath(otherLocale(locale))`
  - `ReviewsPage` → `reviewsPath(otherLocale(locale))`
  - `SeriesPage` → `seriesIndexPath(otherLocale(locale))`
  - `UsesPage` → `usesPath(otherLocale(locale))`
  - `NowPage` → `nowPath(otherLocale(locale))`
  - `YearReviewPage` → `yearPath(otherLocale(locale), year)` - same year number; if that year has no posts in the other locale this 404s (bilingual parity, working agreement #6, makes this unlikely in practice; not specially guarded).
  - `TagPage`: the **index** always maps 1:1 (`tagsIndexPath`). A **specific tag** maps 1:1 only when it's a registered topic (ADR-018) with a recorded EN/IT tag pair (`tagPath(otherLocale, topic.tags[otherLocale])`); an arbitrary organic tag with no recorded pair (e.g. `acoustics`/`acustica`, tagged ad hoc on individual posts) falls back to the other locale's tag **index** rather than guessing a translation.
  - The true home page (`app/[locale]/page.tsx`) and single posts are unchanged.

## Consequences

- Every static index/detail page the switcher can be clicked from now lands on a real page in the other locale, not a dead-end at the home page - except organic (non-topic) single-tag pages, where the honest answer is "no known equivalent", so it goes to the tag index instead of a wrong guess.
- No new dependency, no route change. Verified: `pnpm typecheck` + `pnpm lint` clean on all 10 touched files; `pnpm build:next` output HTML inspected directly (not just types) confirms the serialized `targetPath` reaching the client component: `/it/tag/` embeds `/en/tags`, `/en/tags/audiophile` embeds `/it/tag/audiofilia`, `/it/tag/acustica` (non-topic) embeds `/en/tags`, `/en/archive` embeds `/it/archivio`.
- If a future organic tag should switch locales precisely, promoting it to a registered topic (ADR-018) is the fix - not more special-casing in the switcher.
