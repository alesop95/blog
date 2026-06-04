# ADR-011 - Phase 4 editorial extensions (viz components · Score · Series · Year-in-review)

**Status**: Accepted · **Date**: 2026-06-03 · **Session**: #7 (Phase 4)

## Context

Phase 4 (open-ended editorial extensions) had several remaining items: domain
visualisations for harmony/audio/pedal posts, real music notation, a multi-part
series feature, and an auto-generated year-in-review. The site is a static export
(no server); CI is Linux, the author is on Windows.

## Decisions

### Visualisation components - dependency-free SVG
`<HarmonyDiagram>` (circle of fifths), `<EQGraph>` (log-frequency response curve),
`<PedalSignalFlow>` (signal chain). All **plain SVG/HTML, no chart library**, drawn
with the theme tokens (`var(--color-ink)` / `var(--color-accent)`) so they're
**dark-mode-native**. Props are passed from MDX (`curve={[[20,0],…]}`,
`highlight={["C","G"]}`, `chain={["Guitar","Amp"]}`). Registered in `mdxComponents`.

### Music notation - `<Score>` via abcjs (lazy client)
`<Score abc={…} />` renders ABC notation. **abcjs is dynamically imported inside a
client `useEffect`**, so it's bundled only for pages that mount a `<Score>` (not every
post), and never runs at build. The score sits on the shared always-light
`.diagram__plate` so the black engraving stays legible in dark mode. ABC notation
chosen over MusicXML/Verovio: lighter, text-friendly, good enough for harmony examples.

### Series - index-only, no per-series dynamic route
Frontmatter `series: { name, order? }`; posts with the same name form an ordered arc.
The **series index** (`/en/series` ↔ `/it/serie`) renders **every series as its own
anchored section** (`<section id="<slug>">` + the arc via `<PostsList>`). The post page
shows a banner ("Part of the series X · n of total") linking to `/series#<slug>`.

**Key decision - no `series/[series]` dynamic route.** `output: export` cannot
pre-render a dynamic route whose `generateStaticParams()` resolves to an *empty* set,
and series are dormant (often zero per locale - and zero in production until a post
opts in). A per-series dynamic route would therefore **break the production build**
whenever a locale has no series. Folding everything onto the static index page sidesteps
this entirely and stays export-safe at zero series ("No series yet"). Helpers:
`getAllSeries` / `getSeriesPosts` / `seriesSlug` (`lib/posts.ts`),
`seriesSection` / `seriesIndexPath` (`routing.ts`).

### Year-in-review - dynamic localized route
`/en/year/[year]` ↔ `/it/anno/[year]`: a summary header (post count + total words),
the year's recurring tags, then the posts. Generated per year that has posts - always
≥1 (both locales have 2026 content), so the empty-route problem doesn't apply. Still set
`export const dynamicParams = false` (export-only, no on-demand fallback). Reuses
`getPostsByYear`. Helpers `yearSection` / `yearPath`.

## Consequences

- New dependency: `abcjs` (only loaded client-side, only where a `<Score>` mounts).
- Footer gains a **Series** link; sitemap gains the series index (paired EN↔IT) and the
  year pages (paired). Per-series and (correctly) nothing-when-empty.
- A draft `content/posts/en/component-showcase.mdx` exercises every MDX component - a
  living smoke-test of the authoring pipeline (kept `draft: true`, so out of production;
  temporarily published only to verify the build, then reverted).
- Vitest covers `seriesSlug` + series helpers; the axe a11y suite covers the new
  `/series` and `/year/2026` pages. Build verified at **zero series** (production state).
- **Series and the viz components are dormant** until content uses them - wired, tested,
  documented in `_notes/AUTHORING.md`, ready for the author to adopt.
