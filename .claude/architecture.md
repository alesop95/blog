# Architecture – technical deep-dive

> Updated 2026-05-27 (Session #4). Companion to `CLAUDE.md`.

## Hosting & basePath (ADR-004)

The site is a GitHub Pages **project site** served at `https://alesop95.github.io/blog`.

- `next.config.mjs` reads `BASE_PATH` (`/blog` in `deploy.yml`) → `basePath`, and
  re-exposes it as `NEXT_PUBLIC_BASE_PATH` → `siteConfig.basePath`.
- `NEXT_PUBLIC_SITE_URL` is the **full origin including the base path**
  (`https://alesop95.github.io/blog`), so `siteConfig.url` already carries `/blog`.
  Every absolute URL (canonical, OG, sitemap, robots, feed, JSON-LD,
  `openGraph.url`) is built from it via string concatenation – correct by default.
- **Metadata rule**: Next.js does NOT apply `basePath` to App Router metadata, and
  `new URL('/en', '.../blog')` drops `/blog`. So root-relative metadata
  (`alternates.canonical`/`languages`/`types`, OG/twitter `images`) is made
  **absolute** with `siteConfig.url`. Do not also re-prefix values that already use
  `${siteConfig.url}/...` (would double `/blog`).
- **basePath-unaware links** prefix `siteConfig.basePath` manually: the splash
  inline redirect script + `<noscript>` links (`src/app/page.tsx`) and the plain
  `<a>` RSS link (`Footer.tsx`). next-intl typed `Link`, `next/font`, and
  `_next/static` are basePath-aware automatically.
- The whole `out/` tree is served under `/blog/`, so `out/sitemap.xml`,
  `out/robots.txt`, `out/{en,it}/feed.xml`, and `out/og/...` are reachable at
  `…/blog/…` and match their self-references.

## Rendering model

**Fully static export.** `output: 'export'` in `next.config.mjs` produces a
flat directory of HTML/CSS/JS in `out/` which GitHub Pages serves verbatim.
No server, no Edge runtime, no API routes.

Consequences:

- All pages are Server Components rendered at build time.
- No `revalidate`, no on-demand revalidation. To update content, rebuild and
  redeploy (1–2 minutes via GitHub Actions).
- `next/image` runs unoptimised – resize source images before commit.
- Dynamic OG images are pre-generated at build time (`scripts/build-og.ts`).
- The root locale redirect is browser-side JavaScript (no server to read
  `Accept-Language`).

## Route tree

```
src/app/
├── layout.tsx                 ← minimal root: <html>/<body>, no fonts, no providers
├── page.tsx                   ← root splash with JS locale redirect at /
├── sitemap.ts                 ← bilingual sitemap.xml with hreflang
├── robots.ts                  ← robots.txt
└── [locale]/                  ← all real routes
    ├── layout.tsx             ← fonts, ThemeProvider, NextIntlClientProvider
    ├── page.tsx               ← /en/, /it/ – home (bio + posts list)
    ├── globals.css            ← Tailwind v4 + @theme tokens
    ├── posts/[slug]/page.tsx  ← /en/posts/<slug>, /it/articoli/<slug>
    └── feed.xml/route.ts      ← /en/feed.xml, /it/feed.xml
```

**One `<html>/<body>` in the tree, in `src/app/layout.tsx`** – Next.js requires
this. The locale layout wraps children in a `<div lang={locale}>` instead.

## Data flow

```
content/posts/{en,it}/*.mdx
        │
        │  gray-matter parses YAML frontmatter
        │  Zod validates the shape (PostFrontmatterSchema)
        │  reading-time computes minutes/words
        ▼
   src/lib/posts.ts
     • Cached per-locale collection
     • getAllPosts(locale)
     • getPostBySlug(locale, slug)
     • getAdjacentPosts(locale, slug)
     • getTranslation(post) – finds gemella via articleId
        │
        ├──► [locale]/page.tsx – home renders all posts
        ├──► [locale]/posts/[slug]/page.tsx – single post + adjacent + translation
        │      + extractToc (src/lib/toc.ts): h2/h3 ToC, slugs match rehype-slug
        ├──► [locale]/feed.xml/route.ts – RSS/Atom/JSON per locale
        ├──► app/sitemap.ts – bilingual sitemap with hreflang
        └──► scripts/build-og.ts – one OG PNG per post per locale
```

## i18n internals

Powered by `next-intl` v4. Configuration in `src/i18n/`:

```ts
// routing.ts
defineRouting({
  locales: ['en', 'it'],
  defaultLocale: 'en',
  localePrefix: 'always',
  pathnames: {
    '/': '/',
    '/posts/[slug]': {
      en: '/posts/[slug]',
      it: '/articoli/[slug]',
    },
  },
})
```

Wiring:

- `next.config.mjs` calls `createNextIntlPlugin('./src/i18n/request.ts')`.
- `request.ts` loads `messages/{locale}.json` for the current locale.
- Components consume strings via `useTranslations()` (client) or
  `getTranslations({ locale })` (server).
- Navigation uses the typed helpers from `src/i18n/navigation.ts` (Link,
  router, pathname) so URL segments are auto-localized.
- `setRequestLocale(locale)` is called in every page/layout that takes a
  `locale` param – required by next-intl for proper static rendering.

## Translation pairing

Each post can declare an `articleId` in frontmatter. Two posts with the same
`articleId` (one in EN, one in IT) are considered translations.

`getTranslation(post)` scans the other locale's collection for a matching
`articleId` and returns the gemella post (or null).

This pairing is used by:

- The locale switcher in the header – clicking IT on an EN post navigates
  to the gemella IT slug, not just `/it/` home.
- The sitemap – emits `<xhtml:link rel="alternate" hreflang>` annotations.
- Post page metadata – `alternates.languages` for canonical hreflang.

Slugs are explicitly distinct per locale. SEO-pure.

## Root locale redirect

`src/app/page.tsx` returns minimal markup:

1. Inline `<script>` runs immediately on page load.
2. Reads `localStorage['preferred-locale']`; if set ('en' or 'it'), redirects.
3. Otherwise reads `navigator.language`; if it starts with 'it', redirects to
   `/it/`, else falls back to `/en/`.
4. Uses `location.replace` so the splash doesn't pollute history.
5. `<noscript>` block with manual links for the JS-disabled minority.

The splash inherits ONLY the root layout (no fonts, no Tailwind, no providers).
Inline styles keep the file <2 KB. Total transit time: ~50–150 ms.

## OG images

Generated at build time by `scripts/build-og.ts`:

1. **Before** `next build` (so `public/og/` is populated when Next copies
   `public/` → `out/`), the script reads all posts from `content/posts/`.
2. For each post (+ a default site card), it composes a JSX-shaped object,
   passes it to `satori` → SVG, then to `sharp` → PNG.
3. Output: `public/og/default.png`, `public/og/{locale}/{slug}.png`.
4. Post pages reference their card in OG metadata.

Fonts are pulled from Google Fonts at build time. For a fully offline build,
vendor the `.ttf` files into `public/fonts/` and read them via `readFile`.

`public/og/` is gitignored – regenerated on every deploy.

## Theme switching

`next-themes` provides `<ThemeProvider attribute="class">`. CSS variables in
`globals.css` define `--color-paper`, `--color-ink`, `--color-accent`. Both
light and dark variants are declared under `@theme`.

`ThemeToggle` cycles light → dark → system. Locale-aware aria-label via
`useTranslations('theme')`.

## Build output guarantee

After `pnpm build`:

```
out/
├── index.html                            ← splash redirect
├── en/
│   ├── index.html                        ← English home
│   ├── posts/
│   │   ├── hello-workshop/index.html
│   │   └── on-the-song-before-the-production/index.html
│   └── feed.xml/index.html
├── it/
│   ├── index.html                        ← Italian home
│   ├── articoli/
│   │   ├── ciao-officina/index.html
│   │   └── sulla-canzone-prima-della-produzione/index.html
│   └── feed.xml/index.html
├── og/
│   ├── default.png
│   ├── en/<slug>.png
│   └── it/<slug>.png
├── sitemap.xml
├── robots.txt
├── _next/static/...                      ← JS, CSS, fonts
└── .nojekyll                             ← prevents Jekyll processing
```

GitHub Pages serves this directory under `/blog/` (project site, ADR-004), so
e.g. `out/en/index.html` → `https://alesop95.github.io/blog/en/`.
