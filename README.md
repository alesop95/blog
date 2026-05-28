# Alessio Sopranzi — writings

Personal blog & writings studio. Bilingual EN + IT, hand-built on Next.js 16 +
Tailwind v4 + MDX, hosted on GitHub Pages.

> **Live URL** — `https://alesop95.github.io/blog` (GitHub Pages project site, repo `blog`; see ADR-004)

## What this is

A file-based blog: every article is a `.mdx` file in `content/posts/{en,it}/`,
type-checked frontmatter, build-time static export, no backend, no CMS.

Each article exists in both languages (or only one — locale-exclusive posts
are explicitly allowed) and is paired across locales via an `articleId`
frontmatter field.

## Project memory

Before reading anything else, read **`.claude/CLAUDE.md`** — it explains the
current state, conventions, and how to resume work in a fresh session.

Related docs in `.claude/`:

- `architecture.md` — technical deep-dive
- `roadmap.md` — phases and checkboxes
- `decisions/` — Architecture Decision Records
  - `001-stack.md` — framework + tooling choices
  - `002-hosting-github-pages.md` — why GitHub Pages and no custom domain
  - `003-i18n.md` — bilingual design

## Quick start

Prerequisites: Node ≥20.11, pnpm ≥9.

```bash
pnpm install
pnpm dev          # opens http://localhost:3000
                  # → root splash redirects to /en/ or /it/ based on browser
```

The dev server shows drafts. Production builds hide them.

## Common commands

```bash
pnpm dev          # dev server with hot reload
pnpm build        # next build + OG image generation
pnpm build:next   # just the Next.js build (skip OG)
pnpm build:og     # just the OG images
pnpm verify       # typecheck + lint + full build (CI parity)
pnpm typecheck    # tsc --noEmit
pnpm lint         # biome lint
pnpm format       # biome format --write
pnpm check        # biome check --write (lint + format together)
```

## Adding a post

1. Create `content/posts/<locale>/<slug>.mdx` (locale is `en` or `it`).
2. Add the YAML frontmatter:

   ```yaml
   ---
   title: "..."
   description: "..."
   date: 2026-05-27
   tags: ["..."]
   articleId: "stable-id-shared-across-translations"    # optional
   draft: false                                          # default
   ---
   ```

3. Write the body in MDX. You can `import` components inline.
4. To add a translation, create the matching file under the other locale with
   the SAME `articleId`. The locale switcher will link the two automatically.

## Deploying to GitHub Pages

This project deploys in **project-site mode** at `/blog` (ADR-004): the repo is
named `blog` and the GitHub Pages user-site root slot (`<user>.github.io`) is
left free. The `BASE_PATH=/blog` + `NEXT_PUBLIC_SITE_URL=…/blog` wiring already
lives in `.github/workflows/deploy.yml`.

**One-time setup** (5 minutes):

1. Create a public GitHub repo named **`blog`**.

2. Replace the placeholder in `src/config/site.ts` if your username differs:

   ```ts
   const githubUsername = 'your-github-username'  // ← change to your real username
   ```

3. In the repo on github.com: **Settings → Pages → Source: GitHub Actions**.

4. Push to `main`. The `.github/workflows/deploy.yml` workflow builds and
   publishes the site to `https://<user>.github.io/blog`. After 1–2 minutes the
   URL is live. (The bare `https://<user>.github.io` 404s on purpose.)

That's it. Every subsequent push to `main` redeploys automatically.

### Alternative: user-site mode (blog at the bare root)

If you'd rather the blog own the root URL instead of `/blog`:

- Name the repo **`<your-github-username>.github.io`** (exact match).
- In `deploy.yml` set `BASE_PATH=''` and
  `NEXT_PUBLIC_SITE_URL=https://<user>.github.io`.
- The URL becomes the bare `https://<user>.github.io`. No other code change.

### Adding a custom domain later

Currently we use the free GitHub Pages subdomain (see ADR-002). To switch
to a custom domain later:

1. Buy the domain (cheap registrars: Porkbun, Cloudflare Registrar — ~€7–10/year for `.it`).
2. Configure DNS at the registrar:
   - 4 A records on the apex: `185.199.108.153`, `109.153`, `110.153`, `111.153`.
   - 1 CNAME on `www` pointing to `alesop95.github.io`.
3. Create `public/CNAME` containing just your domain (one line, e.g. `alessioblog.it`).
4. Repo Settings → Pages → Custom domain → enter the domain → wait → tick **Enforce HTTPS**.
5. Update `NEXT_PUBLIC_SITE_URL` in the deploy workflow.

No code changes beyond `public/CNAME` and the env var.

## How i18n works

- Path-based: every real route lives under `/en/...` or `/it/...`.
- The bare root `/` shows a tiny JS splash that redirects based on
  `localStorage` preference (set by the locale switcher) or `navigator.language`.
- URL segments are localized: `/en/posts/foo` ↔ `/it/articoli/foo`.
- Slugs are distinct per locale.
- Translations are paired via the `articleId` frontmatter field.
- UI strings live in `messages/{en,it}.json`.
- See `.claude/decisions/003-i18n.md` for details.

## License

MIT. Code is freely reusable. Article content is © Alessio Sopranzi —
ask before republishing.
