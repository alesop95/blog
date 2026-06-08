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

test('a score exposes a playback control', async ({ page }) => {
  await page.goto('/en/posts/field-notes-workshop/')
  // The <Score> play button appears once abcjs loads and reports audio support.
  await expect(page.getByRole('button', { name: 'Play' }).first()).toBeVisible()
})

test('the circle of fifths keys are playable buttons', async ({ page }) => {
  await page.goto('/en/posts/field-notes-workshop/')
  await expect(page.getByRole('button', { name: 'Play the C chord' })).toBeVisible()
})

test('the EQ playground exposes its controls', async ({ page }) => {
  await page.goto('/en/posts/field-notes-workshop/')
  await expect(page.getByRole('button', { name: 'Play pink noise' })).toBeVisible()
})

// Guards against the <Quote>/MDX regression where a component wrapped block
// children in its own <p>, producing <p><p> (invalid HTML -> hydration error).
for (const path of [
  '/en/posts/field-notes-workshop/',
  '/en/posts/what-a-string-does/',
]) {
  test(`no nested <p> in the article: ${path}`, async ({ page }) => {
    await page.goto(path)
    await expect(page.locator('article p p')).toHaveCount(0)
  })
}

test('skip-to-content link targets the main landmark', async ({ page }) => {
  await page.goto('/en/')
  const skip = page.getByRole('link', { name: 'Skip to content' })
  await skip.focus()
  await expect(skip).toBeVisible() // becomes visible on focus
  await expect(page.locator('#main-content')).toHaveCount(1)
})
