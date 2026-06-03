import { expect, test } from '@playwright/test'

test('home loads and navigates to a post', async ({ page }) => {
  await page.goto('/en/')
  await expect(page.getByRole('main')).toBeVisible()

  // Click the first post link in the writings list and land on a post page.
  const firstPost = page.locator('main a[href*="/posts/"]').first()
  await firstPost.click()
  await page.waitForURL('**/posts/**')
  await expect(page.locator('article')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('reviews index lists a review with a badge', async ({ page }) => {
  await page.goto('/en/reviews/')
  await expect(page.getByRole('heading', { level: 1, name: 'Reviews' })).toBeVisible()
  await expect(page.getByText('Review', { exact: true }).first()).toBeVisible()
})

test('skip-to-content link targets the main landmark', async ({ page }) => {
  await page.goto('/en/')
  const skip = page.getByRole('link', { name: 'Skip to content' })
  await skip.focus()
  await expect(skip).toBeVisible() // becomes visible on focus
  await expect(page.locator('#main-content')).toHaveCount(1)
})
