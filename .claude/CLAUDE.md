# CLAUDE.md — Project Memory

> Living document. Updated at the end of every working session.
> Last update: **2026-05-27** · Session #4 — project-site `/blog` migration (ADR-004); Phase 2-A completed (OG v2, auto ToC, JSON-LD audit, Prev/Next polish).

---

## 1. Project identity

**Name**: Alessio Sopranzi — writings
**URL**: `https://alesop95.github.io/blog` (GitHub Pages **project site**, repo `blog`, `basePath: /blog` — free forever). See ADR-004.
**Owner**: Alessio Sopranzi · GitHub: [`alesop95`](https://github.com/alesop95)
**Type**: Personal blog / writings studio
**Inspired by**: [`dgopsq/writings`](https://github.com/dgopsq/writings) — same conceptual shape (file-based MDX, no custom backend, static rendering), rebuilt from scratch on the modern 2026 stack and personalised to Alessio's voice.

> **Hosting shape (ADR-004)**: the blog is a GitHub *project site* at `/blog`. The single **user-site root slot (`alesop95.github.io`) is deliberately left empty** — no repo, bare domain 404s — so it stays free for a future portfolio/landing page. Coexists independently with the pre-existing `https://alesop95.github.io/skills/` project site. Each GitHub user has one user-site slot (root URL) and unlimited project sites (sub-path URLs), all free forever.

> **Custom domain decision (Session #2)**: Alessio investigated `alessioblog.it` on Register.it. Quoted at €71.43/year (€58.55 + 22% IVA) — too expensive for a personal blog, and Alessio explicitly does not want any recurring cost tied to URL personalisation. Decision: **stay on the free `*.github.io` subdomain indefinitely**. If a custom domain is wanted in the future, the cheapest acceptable path is Porkbun or Cloudflare Registrar (~€8/year for a `.it`), and the migration is a 30-minute DNS + GitHub setting change with zero code impact.

### Editorial positioning (from BIOPIC)

Alessio writes from the intersection of:

- **Engineering & systems** — musical acoustics, multimedia signal processing, computer music, audio hardware (PA, car audio, marine speakers), guitar pedal circuits, workflow automation.
- **Music** — lead guitar, music production, songwriting & arrangement, Italian *cantautorato* lyrics, the philosophy of the acoustically-bare song, encyclopedic rock culture.
- **Theory & humanism** — an in-progress book on harmony and Western music theory (mathematical *and* philosophical).
- **The R&D-as-life mindset** — curiosity-driven deep dives, taking things apart to learn how they work.

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
│  • getTranslationPair(post) — finds the gemella in the other locale     │
│    via the `articleId` frontmatter field                                │
└────────┬───────────────────────────────────┬───────────────────────────┘
         │ (Server Component)                │ (Build-time scripts)
         ▼                                   ▼
┌─────────────────────────────┐  ┌──────────────────────────────────────┐
│ app/[locale]/page.tsx       │  │ app/[locale]/feed.xml/route.ts       │
│ app/[locale]/posts/[slug]/  │  │ app/sitemap.ts (bilingual + hreflang)│
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
│   │   │   ├── posts/[slug]/
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
- **Pathname localization**: `/en/posts/[slug]` ↔ `/it/articoli/[slug]`. `/en/tags/[tag]` ↔ `/it/tag/[tag]`.
- **Drafts**: `draft: true` → visible in dev, hidden in production.
- **Style tokens**: defined in `globals.css` under `@theme`.

---

## 6. Working agreements (Claude ↔ Alessio)

1. **Tracking**: every session ends with an update to this file and to `roadmap.md`.
2. **Decisions**: non-trivial trade-offs → ADR in `.claude/decisions/`.
3. **Scope discipline**: big changes proposed before implementing.
4. **Voice**: UI copy in Alessio's voice. Italian translations of EN seed content are drafts; Alessio polishes.

---

## 7. Current state (end of Session #4)

✅ **Phase 1 — Foundation** (Session #1) — full skeleton, monolingual EN, Vercel target.
✅ **Phase R1 — Re-platform** (Session #2) — GitHub Pages + bilingual EN/IT, OG build-time, deploy workflow.
✅ **Phase 2-A — Reading experience** (Sessions #3–#4 — complete):
- ✅ Syntax-highlighted code via `rehype-pretty-code` + Shiki (github-light + github-dark-dimmed, CSS-variable swap)
- ✅ Copy-button on code blocks (hover-visible, Clipboard API, graceful fallback)
- ✅ Heading anchor links — explicit `#` span, hover-reveal styling
- ✅ Auto Table of Contents (`src/lib/toc.ts` + `Toc.tsx`) — inline collapsible `<details>`, gated >1500 words & ≥3 h2/h3; IDs via `github-slugger` to match `rehype-slug`
- ✅ OG card v2 — Fraunces title + reading-time & first-tag badges (`scripts/build-og.ts`)
- ✅ JSON-LD audit — `BlogPosting` with image, publisher, wordCount, keywords[], mainEntityOfPage, `translationOfWork` (via `articleId` pair)
- ✅ Prev/Next polish — lucide chevrons, title-aware aria-labels

✅ **Project-site `/blog` migration (ADR-004)** — repo `blog`, `basePath: /blog`, all absolute URLs centralised on `siteConfig.url`; user-site root slot left empty.

GitHub username: **`alesop95`**. Site URL (when deployed): **`https://alesop95.github.io/blog`** (project site). User-site root (`alesop95.github.io`) intentionally left empty. Coexists independently with `https://alesop95.github.io/skills/` — see section 1 + ADR-004.

🔜 **Next session (Phase 2-C → 2-B)**:
- Phase 2-C — Polish editoriale (View Transitions, pull-quote, drop-cap)
- Phase 2-B — Discoverability (Pagefind, tags, archive)
- Optional follow-up: add a `public/favicon.ico` + `icons` metadata (currently none shipped; `feed.ts` references a non-existent `/favicon.ico`).

---

## 8. How to resume this project in a fresh chat

The project is fully recoverable from this folder. **Suggested opening prompt**:

> ```
> Sto continuando il progetto del mio blog personale "Alessio Sopranzi — writings"
> (URL https://alesop95.github.io/blog, host GitHub Pages project site, bilingue EN+IT).
> Tutto lo stato è nel repository. Per favore:
>
> 1. Leggi `.claude/CLAUDE.md` per il contesto generale.
> 2. Leggi `.claude/architecture.md` per i dettagli tecnici.
> 3. Leggi `.claude/roadmap.md` per vedere fasi e checkbox.
> 4. Skim di `.claude/decisions/*.md` per le ADR già stabilite.
>
> Siamo a fine [Sessione N — descrizione]. Devo procedere con [Fase X-Y].
> Non assumere nulla che non sia scritto in `.claude/`. Se serve una decisione
> nuova, proponila e apri una ADR prima di scrivere codice.
> ```

**Cosa porta avanti il contesto del progetto, e cosa no:**

- ✅ **Porta avanti**: tutto ciò che è nel repository Git (codice, contenuti, `.claude/`, configurazioni). Questa è la totalità della verità.
- ❌ **Non porta avanti**: chat history, conversazioni informali, decisioni discusse ma non scritte. Se è importante e non è in `.claude/`, è perso.

Quindi la regola: **alla fine di ogni sessione di lavoro significativa, Claude deve aggiornare `.claude/CLAUDE.md` e `.claude/roadmap.md`**, e creare/aggiornare ADR per decisioni di architettura. Se questo non avviene, Alessio segnala nella sessione successiva.

**Portabilità a strumenti diversi** (futuri assistenti AI, te stesso fra mesi): tutta la documentazione è in Markdown standard. Niente sintassi proprietaria, niente dipendenze nascoste. Funziona aperta su qualsiasi editor.
