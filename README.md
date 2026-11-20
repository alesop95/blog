# Alessio Sopranzi - writings

Personal blog of Alessio Sopranzi, written in English and Italian. It is a static site built with Next.js 16, Tailwind CSS v4 and MDX, exported to plain files and served from GitHub Pages at `https://alesop95.github.io/blog`. A move to Cloudflare Pages, needed to send HTTP security headers, is decided but not yet done: see ADR-020.

## How the site is built

Every article is an `.mdx` file under `content/posts/en/` or `content/posts/it/`. Its YAML frontmatter is validated with Zod at build time, so a malformed field stops the build instead of reaching the page. There is no backend and no CMS: `next build` with `output: 'export'` writes the whole site to `out/`, and Pagefind indexes it for search.

Each article is published in both languages. The two files have different slugs and are paired by sharing the same `articleId` in their frontmatter; the schema accepts a post without it, but the editorial rule of the project (working agreement 6 in `.claude/CLAUDE.md`) is that every post has its twin.

## Project memory

The state of the project, its conventions and the way to resume work live in `.claude/`. Start from `.claude/CLAUDE.md`; the technical detail is in `.claude/architecture.md`, the plan in `.claude/roadmap.md`, the latest verified state in `.claude/context/current-work.md`, and every non-trivial choice has an Architecture Decision Record in `.claude/decisions/` (ADR-001 to ADR-020).

## Running it locally

It needs Node 20.11 or later and pnpm 9 or later. The pnpm store is kept inside the project (`.npmrc`, folder `.pnpm-store/`, ignored by git).

```bash
pnpm install
pnpm dev
```

The development server listens on `http://localhost:8642`. The root page redirects to `/en/` or `/it/` from the locale saved by the language switcher, or else from the browser language. Drafts (`draft: true`) are visible in development and left out of production builds.

## Commands

```bash
pnpm dev          # development server on port 8642
pnpm build        # media check, icons, OG images, next build, Pagefind index
pnpm build:next   # next build only
pnpm build:og     # OG images only
pnpm verify       # typecheck, lint, unit tests, full build (what CI runs)
pnpm typecheck    # tsc --noEmit
pnpm lint         # biome lint
pnpm test         # Vitest unit tests
pnpm test:e2e     # Playwright smoke, accessibility and visual tests
pnpm check        # biome lint and format, with fixes written
```

## Adding a post

Create `content/posts/<locale>/<slug>.mdx`, where the locale is `en` or `it`, and start it with the frontmatter. The fields below are the ones a normal post uses; the full schema, including reviews, series and the drop cap, is `PostFrontmatterSchema` in `src/lib/posts.ts`.

```yaml
---
title: "..."
description: "..."            # at most 280 characters
date: 2026-05-27
tags: ["..."]
articleId: "shared-id"        # same value in the other language
draft: false
---
```

The body is MDX, so the components registered in `src/components/MDXComponents.tsx` can be used directly. Then write the twin in the other locale with the same `articleId`: the language switcher links the two pages from that field.

## Deployment

A push to `main` runs `.github/workflows/deploy.yml`, which typechecks, lints, builds with `BASE_PATH=/blog` and publishes `out/` through the official GitHub Pages actions. The repository is a GitHub project site, so the site lives under `/blog` and the user-site root `alesop95.github.io` is deliberately left empty (ADR-004). Pull requests run `.github/workflows/ci.yml` instead.

## Licence

The code is MIT licensed. The articles are © Alessio Sopranzi: ask before republishing them.
