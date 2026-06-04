import { expect, test } from '@playwright/test'

/**
 * Visual regression snapshots for the home page and a representative post.
 * Baselines live in `tests/e2e/visual.spec.ts-snapshots/` and are generated on
 * the Linux CI runner (`pnpm test:e2e:update`). Playwright disables CSS
 * animations during screenshots, so the route view-transition crossfade won't
 * cause flakiness here.
 */
test('home page - visual', async ({ page }) => {
  await page.goto('/en/')
  await expect(page).toHaveScreenshot('home-en.png', { fullPage: true })
})

test('post page - visual', async ({ page }) => {
  await page.goto('/en/posts/hello-workshop/')
  await expect(page).toHaveScreenshot('post-en.png', { fullPage: true })
})
