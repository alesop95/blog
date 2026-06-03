/**
 * Lighthouse CI config. Runs against the built static export (`out/`), served by
 * the dependency-free `scripts/serve-out.mjs`. Wired into `.github/workflows/ci.yml`
 * (the `lighthouse` job), after `pnpm build`.
 *
 * Budgets are intentionally **warn-only** for now: the muted `text-ink/…` palette
 * is a known open color-contrast question, and performance scores vary on CI
 * runners. Once the first run establishes real numbers, promote the stable
 * categories (seo, best-practices) — and accessibility once contrast is settled —
 * to `"error"` to make the budget blocking.
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
        'categories:accessibility': ['warn', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.95 }],
        'categories:seo': ['warn', { minScore: 0.95 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
