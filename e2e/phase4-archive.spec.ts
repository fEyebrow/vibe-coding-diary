import { test, expect } from '@playwright/test';

test.describe('Phase 4: Archive Page', () => {
  test('zh archive renders', async ({ page }) => {
    await page.goto('/zh/posts/');
    await expect(page.locator('.archive-title')).toContainText('Full Archive');
  });

  test('archive shows post cards', async ({ page }) => {
    await page.goto('/zh/posts/');
    const cards = page.locator('.post-card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('post cards are clickable links', async ({ page }) => {
    await page.goto('/zh/posts/');
    const card = page.locator('.post-card').first();
    const href = await card.getAttribute('href');
    expect(href).toBeTruthy();
  });

  test('en archive renders', async ({ page }) => {
    await page.goto('/en/posts/');
    await expect(page.locator('.archive-title')).toContainText('Full Archive');
  });

  test('post card has title and date', async ({ page }) => {
    await page.goto('/zh/posts/');
    const card = page.locator('.post-card').first();
    await expect(card.locator('.post-card-title')).toBeVisible();
    await expect(card.locator('.post-card-meta')).toBeVisible();
  });
});
