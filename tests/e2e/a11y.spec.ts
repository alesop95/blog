import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/**
 * Automated accessibility scan (axe-core) on representative pages, both locales.
 *
 * Zero violations across the board, color-contrast included (the muted palette
 * was darkened to clear AA - see ADR-012).
 *
 * Iframe contents are excluded: the only iframes are third-party embeds
 * (YouTube), whose internal DOM we can't fix. Our own iframe element still
 * carries a `title` (checked outside this exclusion).
 */
const PAGES = [
  '/en/',
  '/it/',
  '/en/posts/hello-workshop/',
  '/it/articoli/ciao-officina/',
  '/en/posts/pathosfera-caparezza/',
  '/en/posts/field-notes-workshop/',
  '/en/reviews/',
  '/en/archive/',
  '/en/series/',
  '/en/year/2026/',
  '/en/uses/',
  '/en/now/',
]

for (const path of PAGES) {
  test(`no axe violations: ${path}`, async ({ page }) => {
    await page.goto(path)
    const results = await new AxeBuilder({ page })
      .exclude('iframe')
      .analyze()
    expect(results.violations).toEqual([])
  })
}

// Dark mode (next-themes follows the system scheme): re-check contrast there too.
test.describe('dark mode', () => {
  test.use({ colorScheme: 'dark' })
  for (const path of ['/en/', '/en/posts/field-notes-workshop/']) {
    test(`no axe violations (dark): ${path}`, async ({ page }) => {
      await page.goto(path)
      await page.waitForFunction(() =>
        document.documentElement.classList.contains('dark'),
      )
      const results = await new AxeBuilder({ page }).exclude('iframe').analyze()
      expect(results.violations).toEqual([])
    })
  }
})
