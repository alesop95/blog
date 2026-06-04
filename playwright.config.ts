import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright runs against the built static export (`out/`), served by the tiny
 * dependency-free server in `scripts/serve-out.mjs`. Run `pnpm build` first
 * (CI does this in a prior step); `pnpm test:e2e` then builds nothing - it just
 * serves and drives a browser.
 *
 * Visual snapshots are inherently platform-sensitive (font hinting differs across
 * OSes), so baselines are generated and compared on the Linux CI runner only.
 * To (re)generate after an intentional visual change: `pnpm test:e2e:update`.
 */
const PORT = 4321

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  expect: {
    // Tolerate sub-pixel anti-aliasing differences in visual snapshots.
    toHaveScreenshot: { maxDiffPixelRatio: 0.02 },
  },
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: `node scripts/serve-out.mjs ${PORT}`,
    url: `http://localhost:${PORT}/en/`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
})
