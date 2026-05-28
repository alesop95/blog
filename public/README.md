# public/

Static assets served at the site root.

## Files you'll want to add

- `favicon.ico` — site favicon
- `icon.png` — 512×512 app icon
- `apple-touch-icon.png` — 180×180 for iOS home-screen

## Files generated at build time

The `pnpm build` command runs `scripts/build-og.ts` after the Next.js build,
which writes:

- `og/default.png` — 1200×630 fallback OG card for the site
- `og/en/<slug>.png` — OG card per English post
- `og/it/<slug>.png` — OG card per Italian post

You do NOT need to commit any of these — the deploy workflow regenerates them
on every build. They are listed in `.gitignore`.
