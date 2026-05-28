# Operational guide — getting from zip to live site

> Step-by-step for the owner (Alessio). Read this once, then again only when
> something goes wrong. Companion to README.md but more conversational.

GitHub username assumed throughout: **`alesop95`**.
Target URL: **`https://alesop95.github.io/blog`** (**project-site** mode, ADR-004).
The repo is named **`blog`**; the user-site root slot (`alesop95.github.io`) is
left empty on purpose, so the bare domain 404s until you repurpose it.

---

## Stage 0 — One-time prerequisites

Make sure you have:

- **Node ≥ 20.11** — `node --version` to check. If missing, install via
  [nvm](https://github.com/nvm-sh/nvm): `nvm install 20 && nvm use 20`.
- **pnpm ≥ 9** — `pnpm --version` to check. If missing: `npm i -g pnpm`.
- **git** — almost certainly already installed.
- A **GitHub account** logged in via the web (you're `alesop95`).

---

## Stage 1 — Run it locally (~5 minutes)

Goal: see the site work on your laptop before pushing anything to GitHub.

1. Unzip the project zip to a path you like (e.g. `~/Sites/blog-alessio/`).

2. In a terminal, change into the folder and install dependencies:
   ```bash
   cd ~/Sites/blog-alessio
   pnpm install
   ```
   Expect: ~30–60 seconds, pnpm downloads packages, ends with `Done`.

3. Start the dev server:
   ```bash
   pnpm dev
   ```
   Expect: `▲ Next.js 16.x · Local: http://localhost:3000` and after a moment
   the line `✓ Ready`.

4. Open `http://localhost:3000` in your browser.

   **What you should see**: a brief flash of an almost-empty page, then an
   automatic redirect to `/en/` or `/it/` based on your browser language.
   If you're in Italy with an Italian browser, you go to `/it/`.

5. Things to try while local:

   - Click **IT** or **EN** in the top-right corner — the site switches
     language. Your choice is saved to `localStorage`, so future visits to
     `/` skip the splash and go straight to your chosen locale.

   - Click any article — you land on its page. Notice the URL:
     `/en/posts/hello-workshop/` for English,
     `/it/articoli/ciao-officina/` for Italian.
     The URL segments are localized too.

   - On a post, hover over a heading — a `#` anchor appears.
     Hover over a code block — a copy button appears in the top right.

   - Click the sun/moon icon → light/dark/system theme cycle.

6. When done, stop the dev server with `Ctrl+C` in the terminal.

   > **Drafts**: `pnpm dev` shows posts with `draft: true` (currently, both
   > Italian seed posts). `pnpm build` hides them. So whatever you see in
   > production is what you've explicitly un-drafted.

---

## Stage 2 — Push to GitHub (~3 minutes)

Goal: get the code into a public repo named exactly `blog` (project-site mode).

1. Go to https://github.com/new (logged in as alesop95).

2. **Repository name**: type exactly `blog`.
   (Do NOT name it `alesop95.github.io` — that would be user-site mode and
   spend your single root slot. We deliberately keep that slot free; see ADR-004.)

3. **Public** (mandatory for free GitHub Pages).
   Do NOT initialise with a README, .gitignore, or licence — we already have
   them and an init would create a merge conflict.

4. Click **Create repository**.

5. In your local terminal, in the project folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit — blog scaffolding (Sessions 1–4)"
   git branch -M main
   git remote add origin https://github.com/alesop95/blog.git
   git push -u origin main
   ```
   Expect: lots of file lines, then `Branch 'main' set up to track 'origin/main'`.

6. Refresh the repo page on GitHub — you should see all the project files.

---

## Stage 3 — Activate GitHub Pages (~2 minutes including build time)

Goal: make the site reachable at `https://alesop95.github.io/blog`.

1. On the repo on GitHub, click **Settings** (top-right tab).

2. In the left sidebar, click **Pages**.

3. **Build and deployment** → **Source**: choose **GitHub Actions** from the
   dropdown. (NOT "Deploy from a branch".)

4. Click **Actions** (top tab of the repo). You should see a workflow run
   called **Deploy** already started (triggered by your initial push).
   Click it to follow the live log: it installs deps, typechecks, lints,
   builds Next.js, generates OG images, uploads the artifact, deploys.
   Total time: ~90–120 seconds.

5. When the workflow is green, open `https://alesop95.github.io/blog` in a new
   browser tab. It might take 30–60 seconds more for the first deploy to
   propagate through GitHub's CDN. Refresh once or twice if you get a 404.
   (The bare `https://alesop95.github.io` 404s on purpose — always use `/blog`.)

   **Done.** The blog is live.

---

## Daily authoring workflow

To add or edit a post:

1. Locally, edit/create files in `content/posts/{en,it}/`.
2. Preview with `pnpm dev`.
3. When happy:
   ```bash
   git add .
   git commit -m "Post: <title>"
   git push
   ```
4. The Actions workflow re-runs (~90 seconds). The change is live.

No CMS, no dashboard, no deploy button. Just `push`.

---

## Troubleshooting

### The Actions workflow failed at typecheck or lint

Run `pnpm verify` locally to reproduce the error. Fix it. Commit. Push.

### The deployed site shows a 404

- Are you visiting `https://alesop95.github.io/blog` (with `/blog`)? The bare
  domain 404s by design.
- Check the repo name is **exactly** `blog` (case-sensitive).
- Check **Settings → Pages → Source** is set to **GitHub Actions**.
- Check the latest workflow run on the **Actions** tab is green (not red).
- If you renamed the repo, the URL's sub-path changes too — `deploy.yml` derives
  `BASE_PATH` / `NEXT_PUBLIC_SITE_URL` from `/blog`, so a rename means updating
  those two env values to the new repo name.

### I want to see a draft post live

Remove `draft: true` from its frontmatter and push.

### I see "WARNING: tracking unstaged changes"

You modified files but haven't committed them. `git status` shows what's
modified. `git add .` then `git commit -m "..."` then `git push`.

### I want to use a custom domain after all

See README.md → "Adding a custom domain later". 30-minute migration, zero
code changes beyond a `public/CNAME` file + env var update.

### I want to move the blog to the bare root (user-site mode) after all

(Reverse of ADR-004 — only if you decide the blog should own the root slot.)

1. Rename the repo to `alesop95.github.io` (Settings → General → Repository name).
2. In `.github/workflows/deploy.yml`, set `BASE_PATH: ''` and
   `NEXT_PUBLIC_SITE_URL: https://${{ github.repository_owner }}.github.io`.
3. Push. The site is now at the bare `https://alesop95.github.io`. No other code
   change — all URLs are derived from `siteConfig.url`.

---

## Coexistence with other repos

You already have `alesop95.github.io/skills/` from a different repo (`skills`).
That is a **project site**. The blog at `alesop95.github.io/blog` (repo `blog`)
is **also a project site**. The two are independent:

- `skills` keeps living at `/skills/` forever, unchanged.
- The blog lives at `/blog`.
- Both are free, public, HTTPS, on the same GitHub account.
- Each push to `main` of `blog` only redeploys the blog.

The single **user-site slot (`alesop95.github.io`, the bare root) is left empty
on purpose** (ADR-004) — it stays free for a future portfolio/landing page. The
bare domain 404s until you build something there. If you ever want the blog at
the root instead, use the "move to user-site mode" recipe above.
