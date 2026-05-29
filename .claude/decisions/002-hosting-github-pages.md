# ADR-002 · Hosting on GitHub Pages (free subdomain, no custom domain)

**Date**: 2026-05-27
**Status**: Accepted (supersedes the Vercel default from ADR-001)

## Context

In ADR-001 the default host was Vercel. Re-examined in Session #2 with explicit attention to:

1. The project is a personal blog with no current or planned features that require server-side execution (no forms with backend processing, no auth, no API endpoints, no database).
2. Owner prefers free, sustainable solutions. No recurring costs.
3. Alessio investigated buying `alessioblog.it` on Register.it. Quoted price: **€71.43/year** (€58.55 + 22% IVA). Considered too expensive for a personal blog.
4. Alessio explicitly stated he does not want any recurring cost tied to URL personalisation – *"per questo blog non ha senso avere una soluzione in cui in futuro pagherò un dominio specifico, [...] altrimenti non mi importa così troppo di avere un URL personalizzato"*.
5. GitHub Pages offers a fully free, HTTPS-enabled, CDN-backed `*.github.io` subdomain in the **user-site** flavour, which gives a clean URL with no path (`https://<username>.github.io`).

## Decision

Host on **GitHub Pages**, in **user-site** mode, on the **free `*.github.io` subdomain**.

Concretely:
- Next.js in static export mode (`output: 'export'` in `next.config.mjs`).
- Build & deploy via GitHub Actions workflow on push to `main`.
- Repository **must be named exactly `alesop95.github.io`** (this is GitHub's convention for user sites – without this naming, you get a project site with a `/repo-name` path component).
- Repository **must be public** (GitHub Pages free tier requirement).
- No `basePath`, no `assetPrefix` – the user-site lives at the root.

Final URL: `https://alesop95.github.io`.

### No custom domain

We do **not** purchase a custom domain at this stage. Reasoning:

- The owner explicitly prioritises zero recurring cost over URL personalisation.
- The `.it` market is expensive (€15-70/year depending on registrar). Cheap registrars exist (Porkbun ~€8/year, Cloudflare Registrar ~€7/year) but the owner does not want any recurring cost.
- If a custom domain is wanted later, the migration is straightforward: buy domain, configure DNS (4 A records + 1 CNAME), add a `public/CNAME` file to the repo, set the domain in **Settings → Pages**, enable HTTPS. Zero code changes. Total time ~30 minutes.

## Trade-offs accepted

| Lost | Mitigation |
| --- | --- |
| Dynamic Edge OG images | Pre-generated at build via `scripts/build-og.ts` (satori + sharp). ~1s per post. Zero runtime cost. |
| Server-side language detection | Browser-side JS splash at root (`src/app/page.tsx`) reads `navigator.language` + `localStorage`. `<noscript>` fallback links. |
| Branch previews | Use `pnpm dev` locally; drafts (`draft: true`) preview without publishing. |
| `next/image` optimisation | `images.unoptimized: true`. Resize sources before commit. |
| API routes / server actions | Not used. Escape hatch if ever needed: separate Cloudflare Workers app (free) callable from this static site. |
| Custom URL like `alessioblog.it` | None – accepted. The free subdomain is the URL. |

## Operational details

### GitHub Pages limits (verified May 2026, all "soft")

- **Bandwidth**: 100 GB / month → ~2M page views. Unreachable.
- **Site size**: 1 GB. The blog will be <50 MB.
- **Build timeout**: 10 minutes. Our builds: 1–2 minutes.
- **Build rate**: 10 / hour – does NOT apply when using a custom GitHub Actions workflow (which we do).

### Repo naming requirement

For user-site mode with a clean root URL:

- Owner's GitHub username (TBD): let's call it `<USER>`.
- Repository name: **must be** `<USER>.github.io`.
- URL: `https://<USER>.github.io`.

If for any reason the repo can't have that exact name (e.g., the slot is already taken by a different project), fall back to **project-site mode**:

- Repository name: anything (e.g., `blog`).
- URL: `https://<USER>.github.io/<repo-name>`.
- Required code changes: set `basePath: '/<repo-name>'` in `next.config.mjs`; set `NEXT_PUBLIC_SITE_URL` accordingly.

These tweaks are isolated and documented in `next.config.mjs`.

## Consequences

**Positive**:

- **Zero recurring cost.** Nothing to renew, ever.
- No vendor dependency beyond GitHub itself.
- HTTPS, CDN, custom domain support (if reconsidered later) – all included.
- Vercel free tier preserved for future apps that need a runtime.

**Negative**:

- Repository must be public (accepted).
- URL is `<username>.github.io` – adequate, not branded.
- Splash redirect at `/` adds 100–200 ms latency for visitors landing on the bare domain. Locale-direct URLs (`/en/`, `/it/`) are unaffected.

## Revisit triggers

Reopen this decision if:

- The owner wants a custom domain after all (cheap path: Porkbun, ~€8/year for `.it`, 30 min setup, no code change).
- A backend is needed (form processing, dynamic content) – escape hatch via Cloudflare Workers.
- GitHub Pages policy changes materially.
