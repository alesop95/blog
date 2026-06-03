# ADR-010 – Quality gates (Vitest · Playwright a11y/visual · Lighthouse CI)

**Status**: Accepted · **Date**: 2026-06-03 · **Session**: #7 (Phase 3)

## Context

Phase 3 adds automated quality gates so regressions surface in CI rather than on
the live site. Four pillars from the roadmap: unit tests on the content layer,
automated accessibility, visual regression, and Lighthouse budgets. The site is a
static export; CI runs on Linux, the author works on Windows.

## Decisions

### Unit tests — Vitest
`vitest` (Node env, `@` alias mirrored in `vitest.config.ts`). Tests live next to
the code (`src/lib/posts.test.ts`). We **export `PostFrontmatterSchema`** so the
highest-value edge cases (required title, 280-char description, date coercion,
`type` enum, half-step `rating`, URL `link`) are tested directly; plus invariant
checks on the public helpers against real content (sort order, `getReviews` purity,
tag ordering, `articleId` pairing). `pnpm test` added to `verify` and to CI.

### Accessibility — axe via Playwright
`@axe-core/playwright` scans representative pages in both locales
(`tests/e2e/a11y.spec.ts`). **Zero violations required**, with two documented
exclusions:
- `color-contrast` disabled — the muted `text-ink/55…/40` palette is an open
  *design* question (a deliberate contrast pass), not a structural bug.
- `iframe` contents excluded — the only iframes are third-party embeds (YouTube),
  whose internal DOM we can't fix; our own `<iframe>` carries a `title`.

The first axe run found and **fixed three real issues**:
- `page-has-heading-one` — the home `Logo` wordmark was a `<span>`; now an `<h1>`.
- `heading-order` — index lists jumped h1→h3; `PostsList` gained a `headingLevel`
  prop (default 2; home's Writings section passes 3, under its `<SectionTitle>` h2).
- `landmark-complementary-is-top-level` — `Callout` and `ReviewHeader` used
  `<aside>` inside `<article>`/`<main>`; both are now `<div role="note">`.

Also added: a **skip-to-content** link (`SkipLink`, first focusable element in the
locale layout) + `id="main-content"` on every `<main>`; Search modal hardening
(input `aria-label`, localized close labels, focus returned to the trigger on close).

### Visual regression — Playwright screenshots
`tests/e2e/visual.spec.ts` snapshots home + a post (`toHaveScreenshot`,
`maxDiffPixelRatio: 0.02`; Playwright auto-disables animations). Served from `out/`
by a dependency-free static server (`scripts/serve-out.mjs`).

**Baselines are per-OS.** Committed baselines are `…-win32.png` (the author's
machine), so visual regression works locally on Windows out of the box. **CI (Linux)
runs only smoke + a11y** — to enable visual there, generate `-linux` baselines once
on a Linux runner (`pnpm test:e2e:update`) and add `visual.spec.ts` to the CI command.
Baselines under `tests/e2e/*-snapshots/` are committed on purpose; reports/results
are gitignored.

### Lighthouse — LHCI
`@lhci/cli` (`lighthouserc.cjs`) runs against `out/` via the same static server,
on three URLs (home, a post, the reviews index). Category budgets
(perf/a11y/best-practices/seo) are **`warn`-only for now** — performance varies on
CI runners and the color-contrast question would otherwise fail accessibility.
**Promote stable categories to `error` once the first run establishes real numbers.**

### CI topology
A new `ci.yml` runs three jobs on PRs / feature pushes: `verify`
(typecheck · lint · **test** · build), `e2e` (Playwright smoke + a11y), `lighthouse`.
**None touch `deploy.yml`** — a failing quality gate blocks a PR, never the live deploy.

## Consequences

- New devDeps: `vitest`, `@playwright/test`, `@axe-core/playwright`, `@lhci/cli`.
- `pnpm verify` now includes unit tests; `pnpm test:e2e` requires a prior `pnpm build`.
- CI gains a Playwright browser install step (chromium, `--with-deps`).
- **Open items** (tracked): resolve color-contrast then enable that axe rule + tighten
  the Lighthouse a11y budget to `error`; optionally add Linux visual baselines for CI.
