# ADR-017 - Spotify embed ("on repeat"), not a live API

**Status**: Accepted · **Date**: 2026-06-08 · **Session**: #8

## Context

Last wishlist feature: a Spotify "currently listening". On a **static export** (GitHub Pages, no server) a *live* now-playing isn't possible without a backend: the Spotify Web API needs OAuth + a refresh token that can't be safely held client-side, and there's no runtime to proxy it. A build-time fetch (refresh token in CI secrets) would give "recently played" but frozen until each deploy, and needs app registration + secrets.

## Decision

Ship a **manual embed**, config-gated (same pattern as Giscus/Newsletter) - zero auth, zero cost, no secrets:

- **`<Spotify url … />`** (`src/components/Spotify.tsx`, server component): parses a Spotify share URL into `{type,id}` and renders the official `open.spotify.com/embed/<type>/<id>` iframe (lazy, `title` for a11y). Heights: track/episode 152, album/playlist 352, `compact` → 152. Unrecognised URL → renders nothing. Registered in `mdxComponents` for use in any music post.
- **"On repeat" on /now**: `siteConfig.spotify.nowPlaying` (a share URL; empty = hidden). `NowPage` renders `<Spotify compact>` under an "On repeat / In loop" heading when set.

Author updates the track/playlist by hand (it's "what I'm listening to lately", which fits the /now page), not auto-pulled.

## Consequences

- No new dependency, no server, no secret. iframe internals are third-party (the axe suite already excludes `iframe` contents; our iframe carries a `title`).
- New i18n `now.listening`. Config-gated → `/now` is unchanged until `nowPlaying` is set.
- **Future option (not taken)**: a scheduled GitHub Action + a `SPOTIFY_REFRESH_TOKEN` secret could fetch real recently-played at build and bake it in, refreshing daily. Revisit only if a manual embed proves insufficient.
