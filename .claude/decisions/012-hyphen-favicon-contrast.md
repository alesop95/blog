# ADR-012 - Plain-hyphen typography · favicon/icons · color-contrast AA

**Status**: Accepted · **Date**: 2026-06-04 · **Session**: #7

Three finishing decisions, grouped because they landed together.

## 1. Typography: plain hyphen everywhere (reverses ADR-005's dash note)

**Decision**: the canonical separator / parenthetical glyph is a **plain hyphen-minus
`-` (U+002D)**, spaced as ` - `. **Never** an en dash `–` or em dash `—`.

This **reverses** the Session #5 convention (em → en dash). Alessio's call: he wants the
short hyphen everywhere ("mai quello lungo") - the en dash read badly on the page.

- **Repo-wide swap**: en dash → `-` (386 occurrences) and em dash → `-` (229) across all
  text files (code, content, UI strings, docs), encoding-safe (UTF-8, no BOM).
- **Pipeline enforcement**: `remark-smartypants` is now `{ quotes: true, dashes: false }`
  (`src/lib/mdx.ts`) - so `--`/`---` in MDX stay as hyphens (quotes/ellipses still
  auto-typographic). The convention is self-enforcing: the build can't emit a long dash.
- Memory updated (`typography-hyphen.md`, replaces `typography-en-dash.md`).

## 2. Favicon / app icons / web manifest (monogram "AS")

**Was a real gap**: no favicon shipped (blank browser tab) and `feed.ts` referenced a
non-existent `/favicon.ico`.

**Decision**: build-time generation, mirroring the OG pipeline.
- `scripts/build-icons.ts`: one "AS" monogram SVG (copper tile, cream serif letters) →
  `sharp` rasterises `favicon-16/32`, `apple-touch-icon` (180), `icon-192/512`, plus
  `favicon.svg` and a `manifest.webmanifest`. Output to `public/icons/` (gitignored,
  regenerated each build). Runs first in the `build` script.
- Root layout metadata declares `icons` (svg + png sizes + apple) and `manifest`, all
  **basePath-prefixed** (Next doesn't apply basePath to metadata URLs - ADR-004).
- Manifest `start_url` baked from `BASE_PATH`; icon `src` relative (resolves under
  `/blog/icons/`).
- `feed.ts` favicon → `/icons/favicon.svg`.

## 3. Color-contrast AA (closes the Phase 3 debt)

**Decision**: resolve the muted-palette contrast debt, then make it blocking.
- Measured empirically with axe: failing fg colors were `text-ink/55` (4.1:1),
  `/45` (3.0), `/40`, and the **accent** as small text (3.15) - all on the paper bg.
- **Fixes**: muted text utilities `text-ink/{55,45,40}` → `text-ink/70` (text only, not
  borders/backgrounds); the prose `li::marker` and `.pullquote figcaption` bumped to 0.7;
  the **light-mode accent** darkened `oklch(0.66 …)` → `oklch(0.52 0.16 50)` so accent
  text clears AA (still warm copper).
- **Gates tightened**: the axe a11y suite no longer disables `color-contrast` (zero
  violations on every tested page, both locales); Lighthouse `categories:accessibility`
  promoted from `warn` to **`error`** (minScore 0.95). Perf/SEO/best-practices stay `warn`
  pending first-run calibration.

## Consequences

- Visual snapshot baselines regenerated (titles lost their en dashes; accent + muted text
  darker).
- Housekeeping closed alongside: the Caparezza review `rating: 4.5` is now final (no longer
  a placeholder). The earlier hero-portrait feather experiment was reverted to a plain
  `rounded-lg` image (kept in the hero, beside the tagline) - the feather looked bad on
  white; and the header search is now icon-only (no `⌘K` label).
- Dark-mode contrast wasn't part of the axe run (it tests the default light scheme); the
  dark accent/ink were left as-is. Revisit if a dark-mode contrast pass is wanted.
