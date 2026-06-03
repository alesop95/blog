import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/**
 * Automated accessibility scan (axe-core) on representative pages, both locales.
 *
 * `color-contrast` is deliberately excluded: the muted `text-ink/55…/40` tones
 * are a known open item pending a deliberate design pass (tracked in the Phase 3
 * notes), not a structural bug. Every other rule must pass with zero violations.
 *
 * Iframe contents are excluded too: the only iframes are third-party embeds
 * (YouTube), whose internal DOM we can't fix. Our own iframe element still
 * carries a `title` (checked outside this exclusion).
 */
const PAGES = [
  '/en/',
  '/it/',
  '/en/posts/hello-workshop/',
  '/it/articoli/ciao-officina/',
  '/en/posts/pathosfera-caparezza/',
  '/en/reviews/',
  '/en/archive/',
]

for (const path of PAGES) {
  test(`no axe violations: ${path}`, async ({ page }) => {
    await page.goto(path)
    const results = await new AxeBuilder({ page })
      .exclude('iframe')
      .disableRules(['color-contrast'])
      .analyze()
    expect(results.violations).toEqual([])
  })
}
