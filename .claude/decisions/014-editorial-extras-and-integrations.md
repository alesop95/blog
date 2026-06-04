# ADR-014 - Editorial extras & integrations (reading UX, standalone pages, embeds, print)

**Status**: Accepted · **Date**: 2026-06-04 · **Session**: #8

## Context

A "nice extras" program: improve the reading experience, add personal-site pages, allow
reader interaction, and make essays printable - all on the static export. (The interactive
music/audio components are their own decision: ADR-013.)

## Decisions

### Reading & editorial
- **Sidenotes** (`<Sidenote>`): auto-numbered via a pure **CSS counter** on `.prose` (no JS
  state). Margin note on wide screens (float right), inset block in flow on narrow ones.
  Marker + note are phrasing content, valid inside `<p>`.
- **Reading progress** (`ReadingProgress`): a thin fixed top bar (`scaleX(progress)`), passive
  scroll listener, `aria-hidden`. On post pages only.
- **TOC scroll-spy** (`Toc` → client): an `IntersectionObserver` (rootMargin `-70%` bottom)
  highlights the link for the section near the top; `aria-current="location"`. Dormant until a
  post is long enough to render the TOC (>1500 words / ≥3 headings).
- **Shared-element transition**: the post title carries the same
  `<ViewTransition name={`post-title-${slug}`}>` in the listing and on the post page, so it
  morphs from list to hero on navigation (extends the View Transitions of ADR-008; no cover
  images needed, fits the text-only listing design).

### Standalone pages
- **/uses** (`/strumenti`) and **/now** (`/ora`): localized static folders + shared
  `UsesPage`/`NowPage`; content in editable configs (`src/config/uses.ts`, `now.ts`, en/it
  shape like `bio.ts`). Footer links + paired sitemap entries.

### Integrations - config-gated, hidden until set
Both run client-side and **render nothing until configured**, so the repo works untouched:
- **Comments**: giscus (`siteConfig.comments`); script injected on mount, theme synced to
  next-themes via `postMessage`, `data-pagefind-ignore`, `data-lang` = locale.
- **Newsletter**: Buttondown (`siteConfig.newsletter.buttondownUser`); a plain no-JS form
  POSTing to Buttondown (`target=_blank` + `rel=noopener`). On the home page.

### Print & quality
- **Print stylesheet** (`@media print`): forces the light palette even in dark mode (resets the
  `--color-*` tokens), hides `header`/`footer`/`[data-pagefind-ignore]` and interactive chrome
  (`print:hidden` on reading bar, TOC, newsletter, EQ playground, score button), full-width
  prose, `break-*` rules. A clean essay copy.
- **Dark-mode contrast**: a `colorScheme: 'dark'` axe pass confirms AA holds in dark too
  (no token changes needed - the `/70` muted tones + light ink on dark clear it).
- **Lighthouse budgets** promoted to **`error`** for all categories (a11y/seo/best-practices
  ≥0.95, performance ≥0.85 to absorb CI-runner noise).

## Consequences

- New configs: `uses.ts`, `now.ts`, `siteConfig.comments`, `siteConfig.newsletter`.
- No new runtime dependencies (giscus/Buttondown are external; loaded only when configured).
- Playwright smoke tests cover the interactive controls; the axe suite covers the new pages
  (light + dark). Everything green; the blog stays feature-complete and static-export-safe.
