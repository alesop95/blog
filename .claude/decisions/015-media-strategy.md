# ADR-015 - Media strategy: photos & video on a static export

**Status**: Accepted · **Date**: 2026-06-08 · **Session**: #8

## Context

We want to embed Alessio's own photos and videos in articles. The site is a static export
on GitHub Pages, which constrains heavy media hard:

- A single file **> 100 MB is rejected** by GitHub; the published-site and bandwidth limits
  are *soft* (~1 GB / ~100 GB-month).
- **Git keeps binaries forever** in history - deleting a big video later doesn't reclaim the
  space without rewriting history.
- **Git LFS is NOT served by GitHub Pages** (Pages returns the pointer text, not the file),
  so LFS is not an option here.
- No runtime: no on-the-fly transcoding or image optimization (`images.unoptimized`).

Principle: *heavy originals never enter Git; media is referenced by URL; all processing
happens at build-time (or before commit), never at runtime.*

## Decision - a hybrid (zero recurring cost; chosen by Alessio)

### Photos - responsive pipeline, build-time
- Originals live in **`_media/<slug>/`** (gitignored).
- `pnpm build:media` (`scripts/build-media.ts`, **sharp**) generates **WebP** variants at up to
  **480 / 960 / 1440 px** (never upscaling; capped at the native width ≤ 1440) into
  `public/images/<slug>/`, and writes `src/generated/image-manifest.json` keyed by the *authored*
  path (`/images/<slug>/<name>.<ext>`).
- `<MdxImage>` (the `![]()` syntax) looks the path up in the manifest and emits
  `<img srcset sizes>` with intrinsic `width`/`height` (no layout shift). No manifest entry ⇒
  plain basePath-resolved `<img>` (already-committed images keep working).
- Committed to Git: the small optimized WebP + the manifest. Out of Git: the heavy originals.
- It's a **manual** step (run when you add photos), so the CI build needs no `_media/` present.

### Short clips - self-hosted, with a build guard
- `<Video src>` plays a file from `public/videos/<slug>/` (unchanged).
- New build guard `scripts/check-media.mjs` (first step of `pnpm build`) **fails the build** if any
  file under `public/videos/` exceeds **20 MB** - so a heavy file can never slip into history.
  Compress before commit with any tool (no ffmpeg dependency in the build, which would be fragile
  cross-platform).

### Heavy video - external embed
- `<YouTube id … />` (existing) and the new **`<Vimeo id hash … />`** (responsive 16:9 iframe;
  `hash` for unlisted videos). The bytes live on the host's CDN, never in Git or on Pages.

## Files

```
_media/<slug>/* ................. originals (gitignored)
scripts/build-media.ts .......... sharp → public/images/<slug>/*.webp + manifest   (pnpm build:media)
scripts/check-media.mjs ......... 20 MB guard over public/videos/   (in pnpm build)
src/generated/image-manifest.json  responsive variants, keyed by authored path     (committed)
src/components/MDXComponents.tsx . <MdxImage> srcset; <Vimeo>; <Video>; <YouTube>
```

## Consequences

- New scripts `build:media` / `check:media`; `build` now runs the guard first.
- `_media/` gitignored; `src/generated/image-manifest.json` committed (seeded as `{}`).
- No new dependencies (sharp already present for OG/icons).
- Authoring (see `_notes/AUTHORING.md`): photos → `_media/` + `build:media` + `![](/images/…)`;
  short clip → `<Video>` (<20 MB); heavy video → `<YouTube>`/`<Vimeo>`.

## Addendum (same session) - the optional items, now shipped

- **AVIF + `<picture>`**: `build:media` also emits AVIF variants; the manifest stores `webp` *and*
  `avif` srcsets; a shared `<ResponsiveImage>` renders `<picture><source type="image/avif"><source
  type="image/webp"><img></picture>` (AVIF preferred, WebP fallback, `<img>` last). `<MdxImage>` and
  `<Figure>` both use it - so `<Figure>` is responsive too.
- **`pnpm build:video`** (`scripts/build-video.mjs`, optional, **not** in `build`): if `ffmpeg` is on
  PATH, transcodes `_media/<slug>/*.{mov,mp4,m4v,webm}` → compressed H.264 MP4 (scaled to ≤1280 w,
  CRF 28, `+faststart`) + a poster frame, into `public/videos/<slug>/`. No source → no-op; no ffmpeg
  → clear guidance and exit 1. The 20 MB guard still applies to the output.
