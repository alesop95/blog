# ADR-008 – Route View Transitions (gentle crossfade) via React `<ViewTransition>`

**Status**: Accepted · **Date**: 2026-06-03 · **Session**: #7 (Phase 2-C)

## Context

Phase 2-C (editorial polish) calls for a subtle transition on route change, "behind
a feature flag in next.config". The stack is Next.js 16.2 + React 19.2 on a **static
export** (GitHub Pages). Even on `output: 'export'`, Next still ships its client router
and performs SPA navigation between the prerendered pages, so a client-side route
transition is available without any server runtime.

## How it works (in plain terms)

**React's `<ViewTransition>` component drives the browser's native View Transitions API.**
In Next.js, *route navigations are React Transitions*, so any `<ViewTransition>` on the
page activates automatically when you navigate — no manual `startViewTransition` call, no
animation library, no lifecycle bookkeeping.

We wrap the locale layout's `{children}` in a single `<ViewTransition>`. On navigation the
browser snapshots the old page, swaps in the new one, and crossfades between the two
snapshots (the default ~250ms `root` transition). The masthead is anchored
(`view-transition-name: site-header`) so it stays rock-steady while only the content
crossfades. Where the browser lacks support, navigation works exactly as before — it just
doesn't animate (progressive enhancement, zero risk).

## Decision

1. **Enable the flag** — `experimental.viewTransition: true` in `next.config.mjs`.
2. **One wrapper, default crossfade** — `import { ViewTransition } from 'react'` and wrap
   `{children}` in `src/app/[locale]/layout.tsx`. A site-wide crossfade says "new content"
   without spectacle — the right register for a text-first writing studio.
3. **Anchor the header** — `<header style={{ viewTransitionName: 'site-header' }}>` plus
   `::view-transition-group(site-header) { animation: none }` so the sticky masthead does
   not flicker during the crossfade.
4. **Tune + gate motion** — a short, soft crossfade on `::view-transition-old/new(root)`,
   wrapped in `@media (prefers-reduced-motion: no-preference)`; a matching
   `(prefers-reduced-motion: reduce)` guard zeroes all view-transition durations so motion-
   sensitive users get an instant swap (the browser default).

### Why the crossfade, not directional slides

The Next guide offers four patterns (shared-element morph, Suspense reveal, directional
slide, same-route crossfade). Directional slides simulate viewport-wide physical movement —
the single most common motion-sickness trigger — and encode a forward/back hierarchy this
blog doesn't have. A crossfade affects opacity, not position: gentler, semantically honest
("same site, different page"), and cheap. We can layer shared-element morphs later (e.g.
OG/cover image → post hero) if a use case appears.

## Consequences

- **Experimental flag**: `experimental.viewTransition` carries the usual "subject to change"
  caveat, but it's used in production by Vercel's own dashboard; the `unstable_` lineage
  reflects the evolving *browser spec*, not implementation quality. Low risk for a personal
  blog; revisit on major Next upgrades.
- **No effect in tests/build output**: the transition is a runtime/browser behavior — the
  static HTML is unchanged. Verify visually in `pnpm dev` (or the deployed site), not by
  grepping `out/`. The build only proves it compiles.
- **Safari**: some view-transition animations differ in Safari; the crossfade degrades
  gracefully.
- **`react-dom`/React**: no extra dependency — App Router already runs the React canary that
  ships `<ViewTransition>`; importing it from `'react'` (no `unstable_` prefix) is correct
  on this stack.
