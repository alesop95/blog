# CLAUDE.md – Project Memory

> Living document. Updated at the end of every working session.
> Last update: **2026-06-03** · Session #7 – **Phase 4 COMPLETE** (ADR-011): MDX viz components `<HarmonyDiagram>`/`<EQGraph>`/`<PedalSignalFlow>` (dependency-free dark-safe SVG) + `<Score>` (abcjs, lazy client, on the light plate); **Series** (frontmatter `series:{name,order}`, index-only page `/series`↔`/serie` with anchored arcs — no per-series dynamic route, export-safe at zero series; post banner) + **Year-in-review** (`/year/[year]`↔`/anno/[year]`, summary+tags+posts); draft `component-showcase.mdx` smoke-tests the pipeline. All Phase-4 viz/series dormant until content adopts them. — Earlier this session: Phase 2-C + review type + **Phase 3 Quality gates COMPLETE** (ADR-010): Vitest unit tests on `lib/posts` (schema exported, 13 tests, in `verify`+CI); axe a11y via Playwright (found+fixed home-missing-h1, heading-order on lists, `<aside>` landmark nesting → `div role=note`; added skip-link + `#main-content`, hardened Search modal); Playwright visual snapshots (win32 baselines committed; CI runs smoke+a11y); Lighthouse CI (`lighthouserc.cjs`, budgets warn-mode); new `ci.yml` jobs verify/e2e/lighthouse (deploy untouched). Static server `scripts/serve-out.mjs`. How-to guide `_notes/AUTHORING.md`. — Earlier this session: Phase 2-C COMPLETE + Phase 4: "review" post type** (ADR-009): frontmatter `type: "review"` + optional `review` block (artist/work/kind/year/rating 0–5 half-step/link); `<ReviewHeader>` spec-strip (layered-star rating); localized index `/reviews` ↔ `/recensioni` (static folders + `<ReviewsPage>`); "Review/Recensione" badge in listings; footer + sitemap; applied to both Caparezza twins (rating 4.5 = placeholder to confirm). — Earlier this session: route View Transitions (React `<ViewTransition>` wrapping the locale layout, `experimental.viewTransition` flag, ~220ms `root` crossfade, anchored masthead, reduced-motion guard — ADR-008); pull-quote `<Quote>` demoed bilingually in the Caparezza review; spacing audit → reading measure capped at `.prose { max-width: 68ch }` (was ~85 CPL, worsening justified gaps); reduced-motion audit → compliant. (Drop-cap + tabular-nums committed earlier as `b613338`.) — Previous: Session #6 – editorial features: justified body text + home bio (hyphenated), basePath-aware images (`![]()` + `<Figure>`), KaTeX math (`remark-math` + `rehype-katex`, siunitx macros) — ADR-005. Fixed localized IT post URLs on static export: route now `[locale]/[section]/[slug]`, `/it/articoli/…` emitted as real files — ADR-006. Dev port → 8642. Engineering authoring: `<Diagram>` (SVG on a dark-mode-safe plate, `wide`), KaTeX macros `\dd`/`\abs`/`\norm`, circuitikz→SVG guide (`_notes/AUTHORING-ENGINEERING.md`). Home wordmark is now plain text (no self-link GET). Bio portrait added to the home About section (`public/images/alessio.jpg`, resized 900×1200/118KB, basePath-aware). Acoustics demo now bilingual: EN twin `content/posts/en/wall-reinforcement-6db.mdx` (articleId `wall-loading-6db`). **Phase 2-B**: tag system (localized index + per-tag pages, clickable tags, footer link, sitemap); archive by year (`/en/archive` ↔ `/it/archivio`); related posts (tag overlap, dormant until posts share tags). Remaining: Pagefind + ⌘K. Also: `<YouTube>` MDX embed (responsive, `youtube-nocookie`); first real **review post** `content/posts/it/pathosfera-caparezza.mdx` (Caparezza – Pathosfera). Roadmap: generic video embed + formal "review" post type. **Pagefind search + ⌘K** shipped (ADR-007) — Phase 2-B complete. Self-hosted `<Video>` added; **full bilingual parity** enforced (4 EN + 4 IT, all paired — working agreement #6). New working agreement #5: mirror every chat explanation into the docs.

---

## 1. Project identity

**Name**: Alessio Sopranzi – writings
**URL**: `https://alesop95.github.io/blog` (GitHub Pages **project site**, repo `blog`, `basePath: /blog` – free forever). See ADR-004.
**Owner**: Alessio Sopranzi · GitHub: [`alesop95`](https://github.com/alesop95)
**Type**: Personal blog / writings studio
**Inspired by**: [`dgopsq/writings`](https://github.com/dgopsq/writings) – same conceptual shape (file-based MDX, no custom backend, static rendering), rebuilt from scratch on the modern 2026 stack and personalised to Alessio's voice.

> **Hosting shape (ADR-004)**: the blog is a GitHub *project site* at `/blog`. The single **user-site root slot (`alesop95.github.io`) is deliberately left empty** – no repo, bare domain 404s – so it stays free for a future portfolio/landing page. Coexists independently with the pre-existing `https://alesop95.github.io/skills/` project site. Each GitHub user has one user-site slot (root URL) and unlimited project sites (sub-path URLs), all free forever.

> **Custom domain decision (Session #2)**: Alessio investigated `alessioblog.it` on Register.it. Quoted at €71.43/year (€58.55 + 22% IVA) – too expensive for a personal blog, and Alessio explicitly does not want any recurring cost tied to URL personalisation. Decision: **stay on the free `*.github.io` subdomain indefinitely**. If a custom domain is wanted in the future, the cheapest acceptable path is Porkbun or Cloudflare Registrar (~€8/year for a `.it`), and the migration is a 30-minute DNS + GitHub setting change with zero code impact.

### Editorial positioning (from BIOPIC)

Alessio writes from the intersection of:

- **Engineering & systems** – musical acoustics, multimedia signal processing, computer music, audio hardware (PA, car audio, marine speakers), guitar pedal circuits, workflow automation.
- **Music** – lead guitar, music production, songwriting & arrangement, Italian *cantautorato* lyrics, the philosophy of the acoustically-bare song, encyclopedic rock culture.
- **Theory & humanism** – an in-progress book on harmony and Western music theory (mathematical *and* philosophical).
- **The R&D-as-life mindset** – curiosity-driven deep dives, taking things apart to learn how they work.

Bilingual from day one (EN + IT) because Alessio writes natively in both. Default fallback is EN.

---

## 2. Stack (as of 2026-05-27, Session #2)

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | **Next.js 16.2** (App Router) | React 19.2 features, React Compiler stable, Turbopack default. |
| Language | **TypeScript 5.7+** strict (`noUncheckedIndexedAccess`) | Type-safe throughout, including content frontmatter. |
| Styling | **Tailwind CSS v4.1** | CSS-first config via `@theme`, Lightning CSS engine. |
| Content | **MDX** in `content/posts/{en,it}/*.mdx` | Markdown + React components, Git-as-CMS. Bilingual by folder. |
| MDX runtime | **`next-mdx-remote`** (RSC variant) | Compile MDX on the server, ship zero MDX runtime to the client. |
| i18n | **`next-intl`** | Path-based, locale-prefixed (`/en/...`, `/it/...`), pathname localization (`/en/posts/...` vs `/it/articoli/...`). |
| Frontmatter | **`gray-matter`** + Zod | YAML, validated. Build fails on malformed input. |
| Code highlighting | **`rehype-pretty-code`** + Shiki (Phase 2-A) | VS Code-grade themes, build-time. |
| Math | **`remark-math`** + **`rehype-katex`** + KaTeX (Session #6) | `$…$`/`$$…$$` rendered to HTML+MathML at build; only katex.min.css ships (post route). siunitx macros `\SI`/`\si`. ADR-005. |
| Reading time | **`reading-time`** | Computed at build. |
| Search | **Pagefind** (Phase 2-B) | Static, build-time index, multilingual. |
| Feeds | **`feed`** package | RSS + Atom + JSON per locale. |
| Theme switching | **`next-themes`** | Light/dark/system, no flash. |
| OG images | **`satori` + `sharp`** at build time | Pre-rendered PNG per post per locale, stored in `public/og/{locale}/{slug}.png`. |
| Icons | **`lucide-react`** | UI icons. |
| Package manager | **pnpm** | Fast, content-addressable. |
| Lint / format | **Biome 2** | Single tool, Rust-fast. |
| Hosting | **GitHub Pages** (project site `/blog`) | Free forever, generous limits, HTTPS auto, CDN. Public repo named `blog`, `basePath: /blog` (ADR-004). User-site root slot left free. |
| Deploy | GitHub Actions → GitHub Pages | Build with `output: 'export'`, publish via official actions. |
| CI | GitHub Actions | Typecheck + lint + build on PR. |

**Hosting trade-offs accepted** (see ADR-002):

- No Edge runtime → no dynamic OG, no server-side language detection, no API routes.
- Root locale redirect via JavaScript splash in `src/app/page.tsx`.
- OG images pre-rendered at build (`scripts/build-og.ts`).
- No branch previews (mitigated by `pnpm dev` showing drafts).
- `next/image` runs unoptimised (resize source images before commit).

---

## 3. Architecture at a glance

```
┌────────────────────────────────────────────────────────────────────────┐
│                  content/posts/{en,it}/*.mdx                           │
│            (YAML frontmatter + MDX body, per locale)                   │
└──────────────┬─────────────────────────────────────────────────────────┘
               │ gray-matter (parse) → Zod (validate) → reading-time
               ▼
┌────────────────────────────────────────────────────────────────────────┐
│  src/lib/posts.ts                                                       │
│  • getAllPosts(locale) / getPostBySlug(locale, slug)                    │
│  • getTranslationPair(post) – finds the gemella in the other locale     │
│    via the `articleId` frontmatter field                                │
└────────┬───────────────────────────────────┬───────────────────────────┘
         │ (Server Component)                │ (Build-time scripts)
         ▼                                   ▼
┌─────────────────────────────┐  ┌──────────────────────────────────────┐
│ app/[locale]/page.tsx       │  │ app/[locale]/feed.xml/route.ts       │
│ app/[locale]/[section]/[slug]│ │ app/sitemap.ts (bilingual + hreflang)│
│ app/page.tsx (splash redir) │  │ scripts/build-og.ts → public/og/...  │
└─────────────────────────────┘  └──────────────────────────────────────┘
                                          │
                                          ▼
                              pnpm build → out/ static export
                                          │
                                          ▼
                       GitHub Actions deploy.yml → GitHub Pages
                                          │
                                          ▼
                       https://alesop95.github.io/blog
```

---

## 4. Folder map

```
.
├── .claude/                     ← project memory + ADRs
│   ├── CLAUDE.md
│   ├── architecture.md
│   ├── roadmap.md
│   ├── onboarding.md
│   └── decisions/
│       ├── 001-stack.md
│       ├── 002-hosting-github-pages.md
│       ├── 003-i18n.md
│       └── 004-project-site-blog.md
├── .github/workflows/
│   ├── ci.yml                   ← typecheck + lint + build on PR
│   └── deploy.yml               ← build + deploy to gh-pages on push to main
├── content/posts/
│   ├── en/                      ← English posts
│   └── it/                      ← Italian posts
├── messages/                    ← UI string translations
│   ├── en.json
│   └── it.json
├── public/                      ← static assets; built OG images land here
├── scripts/
│   └── build-og.ts              ← satori + sharp → per-post OG PNGs
├── src/
│   ├── app/
│   │   ├── page.tsx             ← root splash with JS locale redirect
│   │   ├── [locale]/            ← all real routes
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── globals.css
│   │   │   ├── [section]/[slug]/   ← localized: en /posts/, it /articoli/ (ADR-006)
│   │   │   └── feed.xml/
│   │   ├── sitemap.ts           ← bilingual with hreflang
│   │   └── robots.ts
│   ├── components/
│   │   ├── Logo.tsx · Header.tsx · Footer.tsx · PostsList.tsx ·
│   │   ├── SectionTitle.tsx · ThemeProvider.tsx · ThemeToggle.tsx ·
│   │   ├── MDXComponents.tsx · LocaleSwitcher.tsx · CodeBlock.tsx · Toc.tsx
│   ├── config/
│   │   ├── site.ts
│   │   └── bio.ts               ← { en: [...], it: [...] }
│   ├── i18n/
│   │   ├── routing.ts           ← locales, defaultLocale, pathnames
│   │   ├── navigation.ts        ← typed Link / redirect helpers
│   │   └── request.ts           ← getRequestConfig (loads messages)
│   └── lib/                     ← posts, mdx, feed, toc
├── biome.json
├── next.config.mjs              ← output: 'export', images.unoptimized
├── package.json
├── postcss.config.mjs
├── tsconfig.json
└── README.md
```

---

## 5. Conventions

- **Components**: Server Components by default. `'use client'` only where needed.
- **Imports**: `@/` alias for `src/`.
- **Frontmatter**: validated via Zod. Bad frontmatter → build error.
- **Slugs**: filename = slug. **Distinct per locale**. Paired via `articleId` field.
- **Pathname localization**: `/en/posts/[slug]` ↔ `/it/articoli/[slug]`. `/en/tags/[tag]` ↔ `/it/tag/[tag]`. Implemented via a localized dynamic route segment (`[section]`) + `postSection`/`postPath` in `src/i18n/routing.ts`, NOT next-intl `pathnames` (no middleware on static export — ADR-006).
- **Drafts**: `draft: true` → visible in dev, hidden in production.
- **Style tokens**: defined in `globals.css` under `@theme`.

---

## 6. Working agreements (Claude ↔ Alessio)

1. **Tracking**: every session ends with an update to this file and to `roadmap.md`.
2. **Decisions**: non-trivial trade-offs → ADR in `.claude/decisions/`.
3. **Scope discipline**: big changes proposed before implementing.
4. **Voice**: UI copy in Alessio's voice. Italian translations of EN seed content are drafts; Alessio polishes.
5. **Mirror explanations**: every explanation given to Alessio in chat must also be written into the tracking docs (`.claude/` and/or `_notes/`) — the chat is ephemeral, the docs are the durable record. If it's worth explaining, it's worth documenting.
6. **Bilingual parity**: every article must exist and be published in **both** EN and IT, paired via `articleId`. Same article count per locale. When adding a post in one language, add its twin in the other.

---

## 7. Current state (end of Session #6)

✅ **Phase 1 – Foundation** (Session #1) – full skeleton, monolingual EN, Vercel target.
✅ **Phase R1 – Re-platform** (Session #2) – GitHub Pages + bilingual EN/IT, OG build-time, deploy workflow.
✅ **Phase 2-A – Reading experience** (Sessions #3–#4 – complete):
- ✅ Syntax-highlighted code via `rehype-pretty-code` + Shiki (github-light + github-dark-dimmed, CSS-variable swap)
- ✅ Copy-button on code blocks (hover-visible, Clipboard API, graceful fallback)
- ✅ Heading anchor links – explicit `#` span, hover-reveal styling
- ✅ Auto Table of Contents (`src/lib/toc.ts` + `Toc.tsx`) – inline collapsible `<details>`, gated >1500 words & ≥3 h2/h3; IDs via `github-slugger` to match `rehype-slug`
- ✅ OG card v2 – Fraunces title + reading-time & first-tag badges (`scripts/build-og.ts`)
- ✅ JSON-LD audit – `BlogPosting` with image, publisher, wordCount, keywords[], mainEntityOfPage, `translationOfWork` (via `articleId` pair)
- ✅ Prev/Next polish – lucide chevrons, title-aware aria-labels

✅ **Project-site `/blog` migration (ADR-004)** – repo `blog`, `basePath: /blog`, all absolute URLs centralised on `siteConfig.url`; user-site root slot left empty.

✅ **Typographic housekeeping (Session #5 – 2026-05-29)**:
- ✅ Em dash `—` → **spaced en dash ` – `** repo-wide (216 swaps across 39 files). New project convention: the en dash is the canonical separator/parenthetical glyph — never the em dash. `bio.ts` tight cases respaced to ` – `.
- ✅ Footer credit: `Hand-built with…` → `Built with…` (EN), `Costruito a mano con…` → `Costruito con…` (IT) in `messages/{en,it}.json`.
- ✅ Private **`_notes/`** technical diary established (gitignored, uses-personal): `README.md`, `DIARIO.md` (per-intervention log), `STACK.md` (always-updated stack + flow). Verbose private layer complementing the versioned `.claude/` truth.

✅ **Editorial features (Session #6 – 2026-05-29)** – see **ADR-005**:
- ✅ **Justified body text** with automatic hyphenation (`.prose p, .prose li`; keys off `lang` on the [locale] wrapper, works EN+IT). Headings/captions/code stay left-aligned.
- ✅ **basePath-aware images**: markdown `![alt](/images/… "caption")` mapped to a `MdxImage` component + `<Figure>`, both resolving the `/blog` basePath (plain `<img>` doesn't get it on static export). Source images under `public/images/<slug>/`, resized before commit. CSS for responsive figures.
- ✅ **KaTeX math**: `remark-math` + `rehype-katex` in the MDX pipeline; `$…$`/`$$…$$` rendered to HTML+MathML at build; `katex.min.css` imported only in the post route; siunitx macros `\SI`/`\si`; `throwOnError:false`. Display-math overflow + ink-colour CSS.
- ✅ Demo draft `content/posts/it/propagazione-acustica-parete.mdx` (acoustics, `draft:true`) = authoring template + pipeline smoke-test (verified: 46 katex spans, MathML, `\SI` rendered).

✅ **Localized IT post URLs fixed (Session #6 – ADR-006)**: the static export used to emit IT posts at `/it/posts/<slug>/` while links pointed to `/it/articoli/<slug>/` (404 on every IT post — next-intl pathname localization needs middleware, absent on `output:'export'`). Fixed by making the collection segment a real dynamic route param: `app/[locale]/[section]/[slug]/`, with `generateStaticParams` emitting the localized section. `postSection`/`postPath` (`src/i18n/routing.ts`) are the single source of truth; `routing.pathnames` reduced to `{ '/': '/' }`. Verified: `out/it/articoli/…` emitted, old `/it/posts/…` gone, home link + sitemap consistent. Also: home bio now justified; dev port `8642`; KaTeX demo post published.

✅ **Engineering authoring environment (Session #6 – ADR-005)**:
- ✅ `<Diagram>` MDX component — image/SVG on an always-light "plate" (black-stroke circuitikz/TikZ SVGs stay legible in dark mode), horizontal scroll, optional `wide` breakout. basePath-aware. Alongside `<Figure>` (generic) and the `![]()` image map.
- ✅ KaTeX engineering macros: `\dd`, `\abs`, `\norm` (plus siunitx `\SI`/`\si`).
- ✅ Workflow `circuitikz → SVG` (no TeX toolchain in repo, per ADR-005): compile standalone `.tex` locally → SVG → `public/images/<slug>/` → `<Diagram>`. Full recipe in `_notes/AUTHORING-ENGINEERING.md`.
- ✅ Real sample SVG (image-source method) in the demo post proves the pipeline (verified: `diagram__plate` + SVG ref in built HTML).
- ✅ Home wordmark (`Logo`) is now plain text, not a `<Link href="/">` — it only renders in the home hero, so linking home→home just fired a redundant self-navigation GET. The "go home" link for other pages remains the header "AS" brand.

🚧 **Phase 2-B – Discoverability (started Session #6)**:
- ✅ **Tag system** – localized tag index (`/en/tags`, `/it/tag`) + per-tag pages (`/en/tags/[tag]`, `/it/tag/[tag]`). Helpers `tagSection`/`tagsIndexPath`/`tagPath` in `src/i18n/routing.ts`; data via `getAllTags`/`getPostsByTag` (`src/lib/posts.ts`); shared `<TagPage>` component. Routes are **static localized folders** (`app/[locale]/tags`, `app/[locale]/tag`) restricted per-locale via `generateStaticParams`, coexisting with the dynamic post route (static beats dynamic) — see ADR-006 addendum. Tags clickable on posts, footer link, sitemap entries (index paired EN↔IT). Verified in `out/`.
- ✅ **Archive by year** (`/en/archive` ↔ `/it/archivio`) — posts grouped by year, static localized folders + `<ArchivePage>`, `archiveSection`/`archivePath`, footer link, sitemap (paired). `getPostsByYear` in `lib/posts.ts`.
- ✅ **Related posts** — `getRelatedPosts` (shared-tag count, then recency); section on post pages. Renders only when ≥2 same-locale posts share a tag (current seed posts have disjoint tags, so dormant).
- ✅ **Pagefind search + ⌘K modal** (ADR-007) — `pnpm build` runs `pagefind --site out` (no workflow change; CI/deploy already call `pnpm build`). Indexes only post `<article>` (`data-pagefind-body`); related/prev-next carry `data-pagefind-ignore`. Client modal `src/components/Search.tsx` in the header: Cmd/Ctrl+K, lazy-imports `${basePath}/pagefind/pagefind.js`, debounced, highlighted excerpts. One English index, scoped per locale via a `data-pagefind-filter="lang:<locale>"` + `search(q,{filters:{lang}})` (true per-language stemming would need per-page `<html lang>` — deferred). Dev has no index → graceful "unavailable". **Phase 2-B complete.**

✅ **Self-hosted video + bilingual parity (Session #6)**:
- ✅ `<Video src poster caption />` MDX component — plays an uploaded file from `public/videos/<slug>/` (basePath-aware, `controls`, `preload="metadata"`). Complements `<YouTube>`. (Keep files <100 MB; compress before commit.)
- ✅ **Full bilingual parity** (working agreement #6): **4 EN + 4 IT**, all paired by `articleId`. Published the IT seed twins `ciao-officina` (hello-workshop) and `sulla-canzone-prima-della-produzione` (song-before-production), removed their "draft" notes; added `articleId: pathosfera-caparezza` to the IT review and created the EN twin `content/posts/en/pathosfera-caparezza.mdx`. Verified: `/en/posts` and `/it/articoli` each emit 4, EN review hreflang → IT twin.

✅ **Video embed + first review post (Session #6)**:
- ✅ `<YouTube id title caption />` MDX component — responsive 16:9, privacy `youtube-nocookie`, lazy. The post body serves as the "description below the video".
- ✅ First real **review** published: `content/posts/it/pathosfera-caparezza.mdx` (Caparezza – Pathosfera), embeds the song + tidied review prose, tagged `recensioni`/`musica`/`caparezza`. Currently a normal post.
- 🔜 Roadmap: generic `<Video>` (self-hosted/Vimeo) + formalise a "review" post *type* (frontmatter `type`, artist/track/album header, `/recensioni` index, listing badge) — see roadmap Phase 4.

GitHub username: **`alesop95`**. Site URL (when deployed): **`https://alesop95.github.io/blog`** (project site). User-site root (`alesop95.github.io`) intentionally left empty. Coexists independently with `https://alesop95.github.io/skills/` – see section 1 + ADR-004.

✅ **Phase 2-C – Polish editoriale (Session #7 – 2026-06-03) COMPLETE** — see **ADR-008**:
- ✅ **Route View Transitions** — `experimental.viewTransition: true` (`next.config.mjs`) + `import { ViewTransition } from 'react'` wrapping `{children}` in `src/app/[locale]/layout.tsx`. Route navigations are React Transitions → automatic `root` crossfade (tuned ~220ms). Sticky masthead anchored (`viewTransitionName: 'site-header'` in `Header.tsx` + `::view-transition-group(site-header){animation:none}`). Reduced-motion guard. Crossfade chosen over directional slides (motion-sickness + no forward/back hierarchy). Runtime behaviour — verify in `pnpm dev`, not in `out/`.
- ✅ **Pull-quote `<Quote>`** — `<figure class="pullquote">` (centred display-serif, never justified); now demoed bilingually in `pathosfera-caparezza` (EN+IT).
- ✅ **Drop-cap** + **tabular numerals** — committed earlier (`b613338`): `dropCap: true` frontmatter → `.prose--dropcap`; `tabular-nums` on date columns.
- ✅ **Spacing/line-height audit (measured)** — measure was ~85 CPL (over 66–75 ideal, worsening justified gaps); capped `.prose { max-width: 68ch }`, aligning body left edge with title/description. 17px / 1.7 / 1.1em kept.
- ✅ **Reduced-motion audit** — compliant: global guard + the dedicated `::view-transition-*` block (global `*` doesn't match those pseudo-elements); no JS motion; only colour/opacity transitions in markup.

✅ **Phase 4 – "Review" post type (Session #7 – 2026-06-03) — ADR-009**: see roadmap Phase 4 entry. Reviews are first-class (`type: "review"` + `review` block), with header / index / badge / footer / sitemap. Caparezza twins migrated.

✅ **Phase 3 – Quality gates (Session #7 – 2026-06-03) — ADR-010**: Vitest + axe a11y + Playwright visual + Lighthouse CI; see roadmap Phase 3. Three real a11y bugs fixed. How-to: `_notes/AUTHORING.md`.

✅ **Phase 4 – Editorial extensions (Session #7 – 2026-06-03) — ADR-011**: all items shipped (see roadmap Phase 4). Viz components + Series dormant until content adopts them.

🔜 **Next session**:
- **Full app walkthrough** (agreed with Alessio: once all features are complete, do a complete tour of the application).
- Adopt the dormant features in real content: put posts into a `series:`, use `<Score>`/`<EQGraph>`/`<HarmonyDiagram>`/`<PedalSignalFlow>` in harmony/audio posts.
- **Confirm/adjust** the Caparezza rating (`4.5` placeholder in both twins' frontmatter).
- **Phase 3 follow-ups**: resolve muted-palette color-contrast → enable axe `color-contrast` + tighten Lighthouse a11y budget to `error`; optionally generate Linux visual baselines for CI.
- Optional: add a `public/favicon.ico` + `icons` metadata (currently none shipped; `feed.ts` references a non-existent `/favicon.ico`).

---

## 8. How to resume this project in a fresh chat

The project is fully recoverable from this folder. **Suggested opening prompt**:

> ```
> Sto continuando il progetto del mio blog personale "Alessio Sopranzi – writings"
> (URL https://alesop95.github.io/blog, host GitHub Pages project site, bilingue EN+IT).
> Tutto lo stato è nel repository. Per favore:
>
> 1. Leggi `.claude/CLAUDE.md` per il contesto generale.
> 2. Leggi `.claude/architecture.md` per i dettagli tecnici.
> 3. Leggi `.claude/roadmap.md` per vedere fasi e checkbox.
> 4. Skim di `.claude/decisions/*.md` per le ADR già stabilite.
>
> Siamo a fine [Sessione N – descrizione]. Devo procedere con [Fase X-Y].
> Non assumere nulla che non sia scritto in `.claude/`. Se serve una decisione
> nuova, proponila e apri una ADR prima di scrivere codice.
> ```

**Cosa porta avanti il contesto del progetto, e cosa no:**

- ✅ **Porta avanti**: tutto ciò che è nel repository Git (codice, contenuti, `.claude/`, configurazioni). Questa è la totalità della verità.
- ❌ **Non porta avanti**: chat history, conversazioni informali, decisioni discusse ma non scritte. Se è importante e non è in `.claude/`, è perso.

Quindi la regola: **alla fine di ogni sessione di lavoro significativa, Claude deve aggiornare `.claude/CLAUDE.md` e `.claude/roadmap.md`**, e creare/aggiornare ADR per decisioni di architettura. Se questo non avviene, Alessio segnala nella sessione successiva.

**Portabilità a strumenti diversi** (futuri assistenti AI, te stesso fra mesi): tutta la documentazione è in Markdown standard. Niente sintassi proprietaria, niente dipendenze nascoste. Funziona aperta su qualsiasi editor.
