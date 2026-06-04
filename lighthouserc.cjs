/**
 * Lighthouse CI config. Runs against the built static export (`out/`), served by
 * the dependency-free `scripts/serve-out.mjs`. Wired into `.github/workflows/ci.yml`
 * (the `lighthouse` job), after `pnpm build`.
 *
 * Accessibility is a **blocking** budget (`error`): the color-contrast debt is
 * resolved (palette darkened, axe color-contrast passes on every tested page).
 * Performance/SEO/best-practices stay `warn` for now (perf varies on CI runners);
 * promote them to `error` once the first run establishes stable numbers.
 */
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'node scripts/serve-out.mjs 4322',
      startServerReadyPattern: 'Serving out',
      url: [
        'http://localhost:4322/en/',
        'http://localhost:4322/en/posts/hello-workshop/',
        'http://localhost:4322/en/reviews/',
      ],
      numberOfRuns: 1,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.95 }],
        'categories:seo': ['warn', { minScore: 0.95 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
