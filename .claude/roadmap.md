# Roadmap

> Phased plan. Tick items as they're shipped. New ideas at the bottom of the relevant phase.

---

## Phase 1 - Foundation ✅ (Session #1 - 2026-05-27)

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

## Phase R1 - Re-platform: GitHub Pages + bilingual ✅ (Session #2 - 2026-05-27)

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

## Phase 2-A - Reading experience (Sessions #3-#4 - 2026-05-27) ✅

Make the act of reading a delight.

- [x] Syntax-highlighted code via `rehype-pretty-code` + Shiki (light + dark themes, CSS-variable swap)
- [x] Copy-button on code blocks (hover-visible, Clipboard API, graceful fallback if unsupported)
- [x] Inline anchor links on headings - visual polish (explicit `#` span, hover-reveal)
- [x] Auto-generated Table of Contents for long posts (>1500 words, ≥3 h2/h3) - inline collapsible `<details>`, slugs via `github-slugger` matching `rehype-slug` (`src/lib/toc.ts`, `Toc.tsx`)
- [x] OG card v2: Fraunces title in satori, reading-time badge, first-tag badge (`scripts/build-og.ts`)
- [x] JSON-LD audit: `BlogPosting` with `inLanguage`, `translationOfWork` (via `articleId`), image, publisher, wordCount, keywords[], mainEntityOfPage
- [x] Prev / Next post navigation polish (lucide chevrons, title-aware aria-labels)
- [~] Typographic polish: drop caps option, pull-quote MDX component → **moved to Phase 2-C**

> Session #4 also migrated hosting to **project-site `/blog`** - see **ADR-004** (`.claude/decisions/004-project-site-blog.md`).

## Housekeeping (Session #5 - 2026-05-29)

Piccoli interventi trasversali, fuori fase. Dettaglio granulare in `_notes/DIARIO.md`.

- [x] Em dash `-` → spaced en dash ` - ` repo-wide (216 swaps, 39 files). Convenzione tipografica di progetto stabilita.
- [x] Footer copy: `Hand-built with…` → `Built with…` (EN) / `Costruito con…` (IT).
- [x] Diario tecnico privato `_notes/` (gitignored): README + DIARIO + STACK.

## Editorial features (Session #6 - 2026-05-29)

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

## Phase 2-C - Polish editoriale (Session #4 → completata Session #7, 2026-06-03) ✅

- [x] View Transitions on route change - React `<ViewTransition>` wraps the locale layout's children; `experimental.viewTransition: true` in `next.config`. Soft ~220ms `root` crossfade, sticky masthead anchored (`view-transition-name: site-header`), reduced-motion guard. **ADR-008**.
- [x] Pull-quote `<Quote>` MDX component - `<figure class="pullquote">` (centred display-serif, never justified), demoed bilingually in the Caparezza review.
- [x] Drop-cap option on long posts - opt-in frontmatter `dropCap: true` → `.prose--dropcap` first-letter (committed `b613338`; applied to hello-workshop ↔ ciao-officina).
- [x] Tabular numerals where they should align - `tabular-nums` on the date columns (home, archive, prev/next) (committed `b613338`).
- [x] Spacing & line-height audit on prose, measured - measure was ~85 chars/line (over the 66-75 ideal, worsening justified gaps); capped `.prose { max-width: 68ch }`, aligning the body's left edge with title/description. Font-size 17px / line-height 1.7 / block spacing 1.1em kept (all in range).
- [x] Reduced-motion compliance audit - global guard (zeroes animation/transition/scroll) already present; added the dedicated `::view-transition-*` reduced-motion block (the `*` guard doesn't match those pseudo-elements). No JS-driven motion anywhere; component motion is colour/opacity only. **Compliant.**

## Phase 2-B - Discoverability (Session #5)

- [x] Pagefind index - built at `pnpm build` (`pagefind --site out`), indexes only post `<article>` (`data-pagefind-body`); one English index scoped per-locale via a `lang` filter (ADR-007).
- [x] `⌘K` search modal - `src/components/Search.tsx` in the header (Cmd/Ctrl+K, lazy pagefind load, locale-filtered, highlighted excerpts). Dev shows an "unavailable" message (index only exists in the production build).
- [x] Tag pages: `/en/tags/[tag]` + `/it/tag/[tag]` - static localized folders (`tags/`, `tag/`) sharing `<TagPage>`; `tagSection`/`tagPath`/`tagsIndexPath` helpers; tags clickable on posts; footer link; sitemap entries.
- [x] Tag indexes: `/en/tags` + `/it/tag` - tag cloud with post counts.
- [x] Archive by year: `/en/archive` + `/it/archivio` - posts grouped by year (static localized folders, `<ArchivePage>`, `archiveSection`/`archivePath`); footer link; sitemap (paired).
- [x] Related posts (by tag overlap) - `getRelatedPosts` (shared-tag count, then recency); section on post pages. Dormant until ≥2 same-locale posts share a tag (current seed posts have disjoint tags).

## Phase 3 - Quality gates (Session #7 - 2026-06-03) ✅ - see **ADR-010**

- [x] **Vitest unit tests** on `src/lib/posts.ts` - exported `PostFrontmatterSchema`; 13 tests covering frontmatter edge cases (required title, 280-char desc, date coercion, `type` enum, half-step `rating`, URL `link`) + helper invariants (sort, `getReviews` purity, tag order, `articleId` pairing). In `pnpm test` + `verify` + CI.
- [x] **a11y audit (axe + walkthrough)** - `@axe-core/playwright` on EN+IT pages, zero violations (color-contrast + iframe-contents documented exclusions). Found & fixed: home missing h1 (`Logo`→`<h1>`), `heading-order` on index lists (`PostsList` `headingLevel` prop), `<aside>` landmark nesting (`Callout`/`ReviewHeader`→`<div role="note">`). Added skip-to-content link + `#main-content`; hardened Search modal (input label, localized close, focus return).
- [x] **Visual regression snapshots (Playwright)** - home + a post (`toHaveScreenshot`, 0.02 tolerance), served from `out/` by `scripts/serve-out.mjs`. Baselines per-OS: `-win32` committed (local Windows); CI runs smoke+a11y only (add `-linux` baselines once to enable visual there).
- [x] **Lighthouse CI** - `@lhci/cli` (`lighthouserc.cjs`) on 3 URLs; category budgets in `warn` mode (promote to `error` after first run calibrates). Dedicated `lighthouse` CI job.
- [x] **CI topology** - `ci.yml`: `verify` (typecheck·lint·test·build) + `e2e` (Playwright) + `lighthouse`, none touching `deploy.yml`.

> ✅ **Color-contrast debt resolved (Session #7, ADR-012)**: muted palette darkened (`text-ink/{55,45,40}`→`/70`, accent `oklch(0.52)`), axe `color-contrast` re-enabled (0 violations), Lighthouse a11y budget → `error`. Open: dark-mode contrast pass (axe tests light only); Linux visual baselines for CI; promote perf/seo/best-practices budgets to `error`.

## Finishing touches (Session #7 - 2026-06-04) - ADR-012

- [x] **Favicon / app icons / web manifest** - "AS" monogram → `scripts/build-icons.ts` (sharp) → `public/icons/` (gitignored); root-layout `icons`+`manifest` metadata (basePath-aware); `feed.ts` favicon fixed. Closes the missing-favicon gap.
- [x] **Typography convention reversed** - plain hyphen `-` everywhere (never en/em dash); repo-wide swap + `remark-smartypants` `dashes:false`.
- [x] **Demo article** `field-notes-workshop` / `note-di-officina` (5 EN + 5 IT) exercising every feature; makes the Series index non-dormant.

## Phase 4 - Editorial extensions (open-ended)

Things that emerge from Alessio's writing needs.

- [x] **Video embeds with a description below** - `<YouTube id caption />` (responsive 16:9, `youtube-nocookie`, lazy) **and** `<Video src poster caption />` for **self-hosted uploads** (files under `public/videos/<slug>/`, basePath-aware, `controls`/`preload`). The post body acts as the description. TODO (later): Vimeo, automatic poster generation.
- [x] **"Review / listening" post type** (Session #7, 2026-06-03 - **ADR-009**) - frontmatter `type: "review"` + optional `review` block (artist · work · kind · year · rating 0-5 half-step · source link). `<ReviewHeader>` spec-strip above the prose (half-star rating via layered lucide stars), localized index `/reviews` ↔ `/recensioni` (static folders + `<ReviewsPage>`, `reviewsSection`/`reviewsPath`), "Review/Recensione" badge in `<PostsList>`, footer link + sitemap (paired). Applied to both Caparezza twins (rating `4.5` placeholder - Alessio to confirm). All fields optional; `kind` author-written per language; non-review posts unaffected (`type` defaults to `post`).
- [x] `<Score />` MDX component (Session #7 - **ABC.js**, lazy client import, on the dark-safe plate) for harmony posts. ADR-011.
- [x] `<EQGraph />` (Session #7 - dependency-free SVG, log-frequency response curve) for audio posts. ADR-011.
- [x] `<PedalSignalFlow />` (Session #7 - responsive HTML chain with arrows) for pedal/routing posts. ADR-011.
- [x] `<HarmonyDiagram />` (Session #7 - circle of fifths SVG, optional `highlight`). ADR-011.
- [x] Series feature (Session #7) - frontmatter `series: { name, order }`; **index-only** page (`/en/series` ↔ `/it/serie`) rendering each series' arc as an anchored section (no per-series dynamic route - keeps `output:export` safe at zero series); post banner linking to `/series#<slug>`. ADR-011.
- [x] Year-in-review auto-generated page (Session #7) - `/en/year/[year]` ↔ `/it/anno/[year]`, summary (count + words) + recurring tags + posts. ADR-011.

> All Phase 4 items shipped. Viz components + Series are **dormant** until content uses them (wired, tested, documented in `_notes/AUTHORING.md`). Demo: draft `content/posts/en/component-showcase.mdx`.

## "Nice extras" program (Session #8 - 2026-06-04) ✅ - ADR-013, ADR-014

12 features, one at a time, all verified (Vitest 15 · Playwright 22 · build green):

- [x] **Playable `<Score>`** - abcjs synth, play/stop, lazy AudioContext (ADR-013).
- [x] **Interactive circle of fifths** - clickable keys → triad via Web Audio (`src/lib/audio.ts`).
- [x] **`<EQPlayground>`** - pink noise through a live biquad, real `getFrequencyResponse` curve.
- [x] **Sidenotes** (`<Sidenote>`) - Tufte margin notes, CSS-counter numbering (ADR-014).
- [x] **Reading progress bar** + **TOC scroll-spy** (IntersectionObserver).
- [x] **Shared-element transition** - post title morphs list → hero (extends ADR-008).
- [x] **/uses** (`/strumenti`) + **/now** (`/ora`) - localized pages, editable configs.
- [x] **Comments** (giscus) - config-gated, theme-synced, hidden until configured.
- [x] **Newsletter** (Buttondown) - config-gated no-JS form, hidden until configured.
- [x] **Print stylesheet** - forced-light tokens, chrome hidden, clean essay copy.
- [x] **Dark-mode contrast** verified (axe) + **Lighthouse budgets all → `error`**.

To activate the dormant integrations: fill `siteConfig.comments` (giscus.app) and `siteConfig.newsletter.buttondownUser`. Edit `src/config/uses.ts` / `now.ts` for real content.

## Media strategy (Session #8 - 2026-06-08) ✅ - ADR-015

Hybrid, zero recurring cost:
- [x] **Photos** - responsive pipeline: originals in `_media/<slug>/` (gitignored) → `pnpm build:media` (sharp) → WebP 480/960/1440 in `public/images/<slug>/` + `src/generated/image-manifest.json`; `<MdxImage>` emits `srcset`/`sizes` (+ plain `<img>` fallback).
- [x] **Short clips** - `<Video>` self-hosted + **20 MB build guard** (`scripts/check-media.mjs`).
- [x] **Heavy video** - `<YouTube>` + new `<Vimeo id hash>` embed (bytes never touch Git/Pages).
- [x] **AVIF variants** + shared `<ResponsiveImage>` (`<picture>` AVIF→WebP), applied to `<MdxImage>` **and** `<Figure>`.
- [x] **`pnpm build:video`** - optional ffmpeg clip compressor (→ MP4 + poster); not in `build`.

## Home UX - collapsible disclosures (Session #9 - 2026-06-09) ✅

Richiesta di Alessio: la home non deve mostrare tutto srotolato. Dettaglio in `_notes/DIARIO.md`.

- [x] **Bio a scomparsa** - la sezione "Chi sono" è avvolta in un `<details>` nativo (no JS client), chiusa all'ingresso; il titolo di sezione è anche la maniglia (chevron rotante).
- [x] **Albero scritti anno → mese → articoli** - nuovo `src/components/PostsArchiveTree.tsx`: raggruppa i post (già date-desc) in `Map` anno/mese preservando l'ordine più-recente-prima; le foglie riusano `<PostsList>` (riga identica, badge recensione, morph del titolo). Default: aperto solo l'anno più recente e, dentro, il mese più recente.
- [x] **Stile disclosure** - `.disclosure`/`.disclosure__chev` in `globals.css` (marker nativo nascosto, chevron lucide che ruota su `[open]`); neutralizzato dalla guardia globale reduced-motion. Conteggi via `tags.count` (nessuna nuova stringa i18n). Nessuna nuova ADR (riusa il pattern `<details>` già adottato dal `Toc`).
- [x] Verificato: typecheck + lint puliti (baseline ~30 warning invariata), `next build` verde, HTML della home con i `<details>` annidati.

## Topic pages: interest coverage beyond music (Session #10 - 2026-07-13) ✅ - ADR-018

Richiesta di Alessio, arrivata dalla sessione sul CV (`my-cv`, repo separato): il CV elenca 16 interessi personali come bullet compattati a una riga, e il testo lungo originale era stato archiviato lì, non pubblicato. Idea: il blog diventa il posto dove quegli interessi vengono davvero raccontati, e il CV rimanda qui invece di portarsi dietro la prosa estesa.

- [x] **`src/config/topics.ts`** - 16 topic (id + tag EN/IT), 2 dei quali riusano tag già esistenti (`music`/`musica`, `songwriting`/`songwriting`) invece di crearne di paralleli.
- [x] **`messages/{en,it}.json`** - nuovo namespace `topics.<id>.{title,description}` (16 voci per lingua) + `tags.noPosts` per lo stato vuoto di un topic senza articoli.
- [x] **`generateStaticParams`** di `tags/[tag]` (EN) e `tag/[tag]` (IT) - unione tra i tag reali (da `getAllTags`) e `topicTags(locale)`: un topic ha una pagina statica anche a zero post.
- [x] **`TagPage.tsx`** - `TagIndex` mostra i topic anche a conteggio 0; `TaggedPosts` mostra la descrizione del topic (se presente) sotto l'`h1` esistente, senza toccare la struttura dei titoli (a11y heading-order invariato); stato vuoto dedicato (`tags.noPosts`) invece del fallback generico di `<PostsList>`.
- [x] Verificato: `pnpm typecheck` e `pnpm lint` puliti sui file toccati (baseline warning altrove invariata), `pnpm build:next` genera `/en/tags/<topic>` e `/it/tag/<topic>` con descrizione e stato vuoto presenti nell'HTML statico (controllato `audiophile`/`audiofilia`).
- [x] **Favicon** - il monogramma "AS" sostituito con un'onda audio disegnata (polyline a zigzag), legibile anche a 16px; solo `scripts/build-icons.ts` cambia, `public/icons/` resta gitignorato e si rigenera ad ogni build.
- [ ] Non fatto in questa sessione: scrivere post reali per i 14 topic ancora a zero articoli.

## Locale switcher: percorsi deterministici oltre ai post (Session #10 - 2026-07-13) ✅ - ADR-019

Bug segnalato da Alessio dopo il deploy: su `/it/tag/` (indice tag), cliccare "EN" portava su `/en/` invece di `/en/tags`. Causa: `LocaleSwitcher` sapeva mappare solo un singolo post (via `translationSlug`); ogni altra pagina statica (indice tag, tag singolo, archivio, recensioni, serie, anno, uses, now) ricadeva sempre sulla home dell'altra lingua.

- [x] **`otherLocale(locale)`** in `src/i18n/routing.ts` - l'unica altra lingua, con due lingue.
- [x] **`LocaleSwitcher`/`Header`** - nuovo prop `targetPath`, usato quando non c'e' un post con `translationSlug`; fallback finale invariato (home dell'altra lingua).
- [x] **7 componenti pagina** (`ArchivePage`, `ReviewsPage`, `SeriesPage`, `UsesPage`, `NowPage`, `YearReviewPage`, `TagPage`) calcolano ciascuno il proprio `targetPath` lato server con l'helper di routing gia' esistente per quella sezione. Per `TagPage`: l'indice mappa sempre 1:1; un tag specifico mappa 1:1 solo se e' un topic registrato (ADR-018), altrimenti ricade sull'indice tag dell'altra lingua invece di indovinare una traduzione.
- [x] Verificato: `pnpm typecheck` + `pnpm lint` puliti sui 10 file toccati; `pnpm build:next` + ispezione diretta dell'HTML generato (non solo i tipi) confermano il `targetPath` corretto: `/it/tag/` → `/en/tags`, `/en/tags/audiophile` → `/it/tag/audiofilia`, `/it/tag/acustica` (tag non-topic) → `/en/tags`, `/en/archive` → `/it/archivio`.

## Wishlist

- [x] Giscus comments (config-gated, ADR-014)
- [x] "Now" page (`/now` ↔ `/ora`)
- [x] "Uses" page (`/uses` ↔ `/strumenti`)
- [x] Newsletter bridge (Buttondown, config-gated, ADR-014)
- [x] Spotify "currently listening" embed (`<Spotify>` + `/now` "on repeat", config-gated, ADR-017)
- [ ] Custom domain (declined - Porkbun/Cloudflare Registrar ~€8/year, 30-min migration if reconsidered)

> Wishlist effectively done. The blog is feature-complete across phases 1-4 + extras + media + integrations; the only remaining item (custom domain) is a deliberate no.
