# Roadmap

> Phased plan. Tick items as they're shipped. New ideas at the bottom of the relevant phase.

---

## Phase 1 – Foundation ✅ (Session #1 – 2026-05-27)

The minimum viable site: scaffolding, layout, one post, deploy-ready.

- [x] Project skeleton (Next 16 + TS + Tailwind v4 + Biome + pnpm)
- [x] `.claude/` project memory folder (CLAUDE.md, architecture.md, roadmap.md, decisions/)
- [x] Site config single source of truth (`src/config/site.ts`)
- [x] Root layout with self-hosted fonts + theme provider
- [x] Light/dark/system theme toggle (no flash)
- [x] Home page: bio + posts list (Alessio's voice from BIOPIC)
- [x] Single post page with MDX rendering
- [x] Type-safe frontmatter via Zod
- [x] Reading time computed at build
- [x] RSS / Atom / JSON feed at `/feed.xml`
- [x] Auto-generated `sitemap.xml` and `robots.txt`
- [x] Example posts explaining how to add posts
- [x] CI workflow (typecheck + lint + build)
- [x] README with setup, dev, content authoring, deploy instructions
- [x] `.gitignore`, `.env.example`

## Phase R1 – Re-platform: GitHub Pages + bilingual ✅ (Session #2 – 2026-05-27)

Pivot from Vercel/EN to GitHub Pages/bilingual after owner decision against any recurring cost (custom domain priced too high) and request for native EN+IT from day one.

- [x] ADR-002: GitHub Pages (free subdomain, no custom domain)
- [x] ADR-003: bilingual i18n design (next-intl, path-based, distinct slugs, pathname localization)
- [x] `next.config.mjs` → `output: 'export'`, `images.unoptimized: true`, `trailingSlash: true`
- [x] Replace `next-mdx-remote/rsc` runtime OG with build-time `satori` + `sharp` script (`scripts/build-og.ts`)
- [x] Install `next-intl`, scaffold `src/i18n/{routing,navigation,request}.ts`
- [x] `messages/en.json` and `messages/it.json` for UI strings
- [x] Move routes into `src/app/[locale]/...`
- [x] Root `src/app/page.tsx` splash that redirects to /en/ or /it/ via JS
- [x] Reorganise `content/posts/` → `content/posts/{en,it}/`
- [x] Italian translations of seed posts (drafts; Alessio to polish)
- [x] Italian translation of the BIOPIC (draft in `src/config/bio.ts`; Alessio to polish)
- [x] `LocaleSwitcher` component with cross-locale article pairing via `articleId`
- [x] Bilingual `sitemap.ts` with `hreflang` annotations
- [x] Bilingual feed (`/en/feed.xml` and `/it/feed.xml`)
- [x] GitHub Actions deploy workflow (`.github/workflows/deploy.yml`)
- [x] Updated README with GitHub Pages user-site instructions

## Phase 2-A – Reading experience (Sessions #3–#4 – 2026-05-27) ✅

Make the act of reading a delight.

- [x] Syntax-highlighted code via `rehype-pretty-code` + Shiki (light + dark themes, CSS-variable swap)
- [x] Copy-button on code blocks (hover-visible, Clipboard API, graceful fallback if unsupported)
- [x] Inline anchor links on headings – visual polish (explicit `#` span, hover-reveal)
- [x] Auto-generated Table of Contents for long posts (>1500 words, ≥3 h2/h3) – inline collapsible `<details>`, slugs via `github-slugger` matching `rehype-slug` (`src/lib/toc.ts`, `Toc.tsx`)
- [x] OG card v2: Fraunces title in satori, reading-time badge, first-tag badge (`scripts/build-og.ts`)
- [x] JSON-LD audit: `BlogPosting` with `inLanguage`, `translationOfWork` (via `articleId`), image, publisher, wordCount, keywords[], mainEntityOfPage
- [x] Prev / Next post navigation polish (lucide chevrons, title-aware aria-labels)
- [~] Typographic polish: drop caps option, pull-quote MDX component → **moved to Phase 2-C**

> Session #4 also migrated hosting to **project-site `/blog`** – see **ADR-004** (`.claude/decisions/004-project-site-blog.md`).

## Housekeeping (Session #5 – 2026-05-29)

Piccoli interventi trasversali, fuori fase. Dettaglio granulare in `_notes/DIARIO.md`.

- [x] Em dash `—` → spaced en dash ` – ` repo-wide (216 swaps, 39 files). Convenzione tipografica di progetto stabilita.
- [x] Footer copy: `Hand-built with…` → `Built with…` (EN) / `Costruito con…` (IT).
- [x] Diario tecnico privato `_notes/` (gitignored): README + DIARIO + STACK.

## Editorial features (Session #6 – 2026-05-29)

Richieste di Alessio. Dettaglio in `_notes/DIARIO.md`; decisione in **ADR-005**.

- [x] Testo giustificato con sillabazione automatica (`.prose p, .prose li`, EN+IT).
- [x] Immagini basePath-aware: `![]()` + `<Figure>` → `/blog/...`; storage in `public/images/<slug>/`.
- [x] Matematica KaTeX: `remark-math` + `rehype-katex`, `$…$`/`$$…$$`, macro siunitx `\SI`/`\si`.
- [x] Post demo/template `it/propagazione-acustica-parete.mdx` (pubblicato) + smoke-test pipeline.
- [x] Bio della home giustificato (`text-justify` + `hyphens-auto`).
- [x] Porta dev → `8642` (`next dev -p 8642`).
- [x] **Fix URL IT localizzati su export statico** (ADR-006): route → `[locale]/[section]/[slug]`, `/it/articoli/…` generati come file reali. `postSection`/`postPath` unica fonte di verità; `routing.pathnames` ridotto a `{ '/': '/' }`. Verificato in `out/`.
- [x] Ambiente ingegneristico: `<Diagram>` (SVG su lastra dark-safe, `wide`), macro KaTeX `\dd`/`\abs`/`\norm`, ricetta `circuitikz → SVG` (`_notes/AUTHORING-ENGINEERING.md`), SVG d'esempio nel post demo.
- [x] Home wordmark non più cliccabile (fix GET a vuoto verso sé stessa).
- [ ] Applicare lo stesso pattern (segmento localizzato + generateStaticParams) a tag/archivio in Phase 2-B, NON `pathnames` next-intl.

## Phase 2-C – Polish editoriale (Session #4)

- [ ] View Transitions on route change (React 19.2 API; behind feature flag in next.config)
- [ ] Pull-quote `<Quote>` MDX component
- [ ] Drop-cap option on long posts
- [ ] Tabular numerals where they should align
- [ ] Spacing & line-height audit on prose, measured
- [ ] Reduced-motion compliance audit

## Phase 2-B – Discoverability (Session #5)

- [ ] Pagefind index, multilingual mode
- [ ] `⌘K` search modal
- [x] Tag pages: `/en/tags/[tag]` + `/it/tag/[tag]` — static localized folders (`tags/`, `tag/`) sharing `<TagPage>`; `tagSection`/`tagPath`/`tagsIndexPath` helpers; tags clickable on posts; footer link; sitemap entries.
- [x] Tag indexes: `/en/tags` + `/it/tag` — tag cloud with post counts.
- [x] Archive by year: `/en/archive` + `/it/archivio` — posts grouped by year (static localized folders, `<ArchivePage>`, `archiveSection`/`archivePath`); footer link; sitemap (paired).
- [x] Related posts (by tag overlap) — `getRelatedPosts` (shared-tag count, then recency); section on post pages. Dormant until ≥2 same-locale posts share a tag (current seed posts have disjoint tags).

## Phase 3 – Quality gates

- [ ] Lighthouse CI in GitHub Actions with budgets enforced
- [ ] Visual regression snapshots (Playwright) for home + sample post
- [ ] Vitest unit tests on `src/lib/posts.ts` (frontmatter edge cases)
- [ ] Manual a11y audit (axe + keyboard walkthrough)

## Phase 4 – Editorial extensions (open-ended)

Things that emerge from Alessio's writing needs.

- [ ] `<Score />` MDX component (ABC.js or Verovio) for harmony posts
- [ ] `<EQGraph />` for audio engineering posts
- [ ] `<PedalSignalFlow />` for pedal-circuit posts
- [ ] `<HarmonyDiagram />` – circle of fifths, chord voicing visualiser
- [ ] Series feature: posts can belong to a series, page shows the arc
- [ ] Year-in-review auto-generated page

## Wishlist / not yet committed

- Giscus comments (GitHub Discussions backend)
- "Now" page (`/now`)
- "Uses" page (`/uses`)
- Newsletter bridge (Buttondown)
- Spotify "currently listening" embed
- Custom domain (if owner reconsiders – Porkbun/Cloudflare Registrar ~€8/year, 30-min migration)
