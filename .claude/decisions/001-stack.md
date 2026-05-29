# ADR-001 · Stack selection

**Date**: 2026-05-27
**Status**: Accepted

## Context

We need a personal blog for Alessio Sopranzi. Requirements:

1. Modern full-stack best practices as of May 2026.
2. Continuously deployable to a public URL.
3. Easy for Alessio to add new articles & content over time.
4. Built from scratch (not a fork of `dgopsq/writings`, though that project is the conceptual reference).
5. The owner is technical (full-stack engineer + audio DSP background), so a Git-driven content workflow is acceptable and probably preferred.

Constraints:

- One-person project, hobby cadence – minimise infrastructure to maintain.
- No paid services required at v1 (we should fit within free tiers).
- Content portability – posts must remain readable plain text outside the system.

## Decision

| Concern | Choice | Runner-up considered | Why not the runner-up |
| --- | --- | --- | --- |
| Framework | **Next.js 16 (App Router)** | Astro 5 | Next 16 + React 19.2 is the centre of gravity of the React ecosystem in 2026. Astro is excellent for content sites, but Alessio's roadmap (interactive harmony diagrams, EQ graphs, signal-flow widgets) leans on rich client components – React-first wins. |
| Styling | **Tailwind CSS v4** | Vanilla CSS modules | v4's CSS-first config + Lightning CSS engine removes the historical friction. We get tokens-as-CSS-variables and utilities without a config file to maintain. |
| Content | **MDX files in repo** | Sanity (headless CMS) | Git-as-CMS is free, version-controlled, offline-editable, diff-able. Sanity adds a service dependency, an API surface, and a monthly bill once you grow. Easy to add Sanity later without rewriting renderers. |
| Search | **Pagefind** | Algolia / Meilisearch hosted | Static, free, no backend, no API key. Indexes built HTML – no separate content schema to maintain. |
| Hosting | **Vercel** | Cloudflare Pages, GitHub Pages | Native Next.js support, free tier covers a personal blog, automatic CI on `git push`, edge functions for OG images. Cloudflare Pages is a close second; chosen Vercel for lower friction with `next/og`. |
| Package manager | **pnpm** | npm, Bun | Disk-efficient, deterministic, mainstream-friendly. Bun is faster but its Node compat surface still has gaps that bite in Next.js edge cases. |
| Lint / format | **Biome 2** | ESLint + Prettier | Single tool, Rust-fast, less config drift. ESLint flat config is fine but slower and noisier. |

## Consequences

**Positive**:

- Stack is mainstream in 2026 – every choice has thriving docs, community, and AI-assistant familiarity. Future Claude sessions will navigate it fluently.
- Zero recurring cost at v1.
- Content is portable: every post is a plain `.mdx` file with YAML frontmatter. Migrating to any other static site generator would be hours, not weeks.
- Vercel does the deployment plumbing for us – push to `main`, site updates.

**Negative / trade-offs**:

- Vercel lock-in for the dynamic-OG-image feature. Mitigated: documented escape hatch in `architecture.md` §1.
- Tailwind v4 is recent – some ecosystem plugins (the historical `@tailwindcss/typography` etc.) needed a generation to catch up. We don't use `typography` (we write our own prose styles), so we sidestep this.
- MDX-in-repo means content edits require Git. If Alessio later wants a web UI to draft posts, we'd add TinaCMS (which writes back to Git) – preserves the source of truth. This is not blocking today.

## Revisit triggers

Reopen this decision if:

- Vercel pricing changes materially for personal projects.
- Alessio wants non-technical collaborators to edit posts.
- We need server-side data sources (database, auth, paid content) – at which point the "no backend" assumption is gone and the whole stack should be re-evaluated.
