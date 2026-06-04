/**
 * Lighthouse CI config. Runs against the built static export (`out/`), served by
 * the dependency-free `scripts/serve-out.mjs`. Wired into `.github/workflows/ci.yml`
 * (the `lighthouse` job), after `pnpm build`.
 *
 * All four categories are **blocking** (`error`). Accessibility/SEO/best-practices
 * hold a 0.95 floor (deterministic for a clean static site); performance keeps a
 * lower 0.85 floor to catch real regressions without flaking on noisy CI runners.
 * The first CI run validates the real numbers - nudge a floor if one proves tight.
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
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.95 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
