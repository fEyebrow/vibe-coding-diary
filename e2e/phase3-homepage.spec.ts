import { test, expect } from '@playwright/test';

test.describe('Phase 3: Homepage', () => {
  test('zh homepage renders hero', async ({ page }) => {
    await page.goto('/zh/');
    await expect(page.locator('.hero')).toBeVisible();
    await expect(page.locator('.illustration-container')).toBeVisible();
  });

  test('hero has tagline with vibe coding accent', async ({ page }) => {
    await page.goto('/zh/');
    await expect(page.locator('.tagline-accent')).toBeVisible();
    await expect(page.locator('.tagline-accent')).toContainText('vibe coding');
  });

  test('RECENT LOGS section visible', async ({ page }) => {
    await page.goto('/zh/');
    await expect(page.locator('.section-header h2')).toContainText('RECENT LOGS');
  });

  test('shows recent posts', async ({ page }) => {
    await page.goto('/zh/');
    const items = page.locator('.post-item');
    await expect(items).toHaveCount(3);
  });

  test('post items have READ. link', async ({ page }) => {
    await page.goto('/zh/');
    const readLinks = page.locator('.read-more');
    const count = await readLinks.count();
    expect(count).toBeGreaterThan(0);
    await expect(readLinks.first()).toContainText('READ.');
  });

  test('root redirects', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/(zh|en)\//);
  });

  test('en homepage shows english posts', async ({ page }) => {
    await page.goto('/en/');
    await expect(page.locator('.hero')).toBeVisible();
    const items = page.locator('.post-item');
    await expect(items).toHaveCount(3);
  });
});
