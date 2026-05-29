# ADR-004 · Project-site mode at `/blog` (user-site root left free)

**Date**: 2026-05-27
**Status**: Accepted (supersedes the *user-site* hosting choice in ADR-002; ADR-002's "free GitHub Pages, no custom domain, no recurring cost" stance still holds)

## Context

ADR-002 chose GitHub Pages **user-site** mode: repo named `alesop95.github.io`, served at the bare `https://alesop95.github.io`. Re-examined in Session #4:

1. A GitHub account has exactly **one** user-site slot (the root URL) and unlimited project sites (sub-path URLs). Spending the single root slot on the blog forecloses using it later for a portfolio / landing page.
2. Alessio wants to keep that root slot **free for the future** and is happy for the blog to live under a sub-path, managing entry via the blog's own (already-existing) redirects.
3. The cost/》domain stance is unchanged: still free `*.github.io`, still no recurring cost.

## Decision

Host the blog as a GitHub Pages **project site**:

- Repository named **`blog`** (public).
- URL: **`https://alesop95.github.io/blog`**.
- `basePath: '/blog'` in `next.config.mjs` (driven by `BASE_PATH=/blog` in the deploy workflow).
- `NEXT_PUBLIC_SITE_URL=https://alesop95.github.io/blog` – the full public origin **including** the base path. `siteConfig.url` therefore already contains `/blog`, and every absolute URL (canonical, OG, sitemap, robots, feed, JSON-LD) is built from it.
- The **user-site root slot is left empty** – there is no `alesop95.github.io` repo. The bare domain returns GitHub's 404 until/unless Alessio repurposes it later. **No redirect stub** (considered and declined – keeps the slot genuinely untouched).
- The blog's existing internal redirects (root splash `/blog/` → `/blog/en/` | `/blog/it/`) remain the only redirect machinery.

Coexists with the pre-existing `https://alesop95.github.io/skills/` project site – both are independent project sites under the same account.

## The basePath / metadata rule (important)

Next.js does **not** apply `basePath` to App Router metadata, and `new URL('/en', 'https://host/blog')` resolves to `https://host/en` – it **drops `/blog`**. Therefore:

- Every metadata value that would otherwise be root-relative (`alternates.canonical`, `alternates.languages`, `alternates.types`, `openGraph.images`, `twitter.images`) is made **absolute** by prefixing `siteConfig.url`.
- Raw string URLs already built as `${siteConfig.url}/...` (sitemap, robots, feed, JSON-LD, `openGraph.url`, per-post OG image) are correct automatically – do **not** prefix them twice.
- Links that bypass the framework's basePath handling must prefix `siteConfig.basePath` manually: the root splash inline redirect script + `<noscript>` links (`src/app/page.tsx`) and the plain `<a>` RSS link (`src/components/Footer.tsx`). next-intl typed `Link`, `next/font`, and `_next/static` are basePath-aware and need no change.

## Consequences

**Positive**:
- User-site root slot stays free for a future landing page / portfolio.
- Zero recurring cost preserved; still pure static export on GitHub Pages.
- All URL generation is centralised on `siteConfig.url`, so a future move (custom domain, or even back to user-site) is a deploy-env change plus repo rename, not a code rewrite.

**Negative / trade-offs**:
- The bare `https://alesop95.github.io` 404s until repurposed – accepted. Share/link the `/blog` URL (the feed, sitemap, and OG tags all carry it).
- One more gotcha class to remember: any newly-added raw URL or plain `<a>`/`<script>` must account for basePath (documented above and in `architecture.md`).

## Operational steps (one-time)

1. Create the public repo named **`blog`** (not `alesop95.github.io`).
2. **Settings → Pages → Source: GitHub Actions**.
3. Push to `main`; the existing `deploy.yml` (now carrying `BASE_PATH=/blog`) builds and publishes to `https://alesop95.github.io/blog`.

## Revisit triggers

- Alessio wants the blog at the bare root after all → rename repo to `alesop95.github.io`, set `BASE_PATH=''` and `NEXT_PUBLIC_SITE_URL=https://alesop95.github.io`. No other code change.
- A custom domain is wanted → ADR-002's migration path (cheap registrar, `public/CNAME`), with `BASE_PATH` cleared and `NEXT_PUBLIC_SITE_URL` set to the domain.
