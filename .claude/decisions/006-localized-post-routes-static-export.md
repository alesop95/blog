# ADR-006 – Localized post routes on static export (revises ADR-003's mechanism)

**Status**: Accepted · **Date**: 2026-05-29 · **Session**: #6
**Relationship**: Revises the *implementation mechanism* of ADR-003 for the post
collection. ADR-003's intent (localized URLs `/en/posts/…` ↔ `/it/articoli/…`) is
**preserved**; only *how* it's achieved changes.

## Context

ADR-003 implemented pathname localization via next-intl `pathnames`
(`/posts/[slug]` → `{ en:'/posts/[slug]', it:'/articoli/[slug]' }`), with the route
file at `src/app/[locale]/posts/[slug]/page.tsx`.

next-intl's pathname localization rewrites the *external* localized URL to the
*internal* route at request time **via middleware**. On a `output: 'export'` static
build deployed to GitHub Pages there is **no middleware**, so the rewrite never runs.

**Bug discovered Session #6**: the build emitted IT posts at `/it/posts/<slug>/`
(the literal folder name) while every IT link pointed to `/it/articoli/<slug>/`
(next-intl `Link` localizes the href). Mismatch ⇒ **404 on every Italian post** on the
live site. It had stayed latent because all IT seed posts were `draft:true` (hidden in
production); it surfaced when the first non-draft IT post (the KaTeX demo) was built.

## Decision

Stop relying on next-intl `pathnames` for posts. Make the localized collection segment
a **real dynamic route param** and generate the localized paths directly at build time.

- Route folder renamed: `src/app/[locale]/posts/[slug]/` → **`src/app/[locale]/[section]/[slug]/`**.
- `generateStaticParams` emits `{ locale, section, slug }` with `section = postSection(locale)`
  (`en → posts`, `it → articoli`). So `/en/posts/x` and `/it/articoli/x` exist as **real
  static files**. A guard `section !== postSection(locale)` ⇒ `notFound()`.
- Single source of truth in `src/i18n/routing.ts`:
  - `postSection(locale)` → `'posts' | 'articoli'`
  - `postPath(locale, slug)` → `/${locale}/${postSection(locale)}/${slug}`
- `routing.pathnames` reduced to `{ '/': '/' }` (next-intl now only handles the locale
  prefix for static pathnames like the home).
- All link/URL sites use `postPath`: `PostsList`, `LocaleSwitcher` (now via the plain
  `next/navigation` router), the post page (prev/next + metadata alternates + JSON-LD),
  `sitemap.ts`, `lib/feed.ts`. Post links use `next/link` (basePath auto-applied);
  hrefs are cast `as Route` to satisfy `typedRoutes`.

## Consequences

- ✅ `/it/articoli/<slug>/` and `/en/posts/<slug>/` are emitted as real files — no 404.
  Verified in `out/`: `it/articoli/…` exists, `it/posts/…` gone, home link + sitemap match.
- We lose next-intl's automatic pathname rewriting for posts — irrelevant, since it never
  worked on static export anyway. The `postPath` helper is simpler and explicit.
- Future localized collections (tags `/en/tags` ↔ `/it/tag`, archive, etc.) should follow
  the **same pattern** (dynamic localized segment + `generateStaticParams`), NOT next-intl
  `pathnames`. ADR-003's `pathnames` snippet for tags is superseded accordingly.
- After renaming a route folder, `.next/types` goes stale → `pnpm typecheck` fails on a
  dangling validator import. Fix: delete `.next` before re-running `pnpm verify`.
