import { test, expect } from '@playwright/test';

test.describe('Phase 1: Skeleton + Global Styles + Dark Mode + i18n', () => {
  test('page loads and shows header', async ({ page }) => {
    await page.goto('/zh/');
    await expect(page.locator('.site-title')).toContainText('VIBE CODING DIARY');
  });

  test('nav links visible', async ({ page }) => {
    await page.goto('/zh/');
    await expect(page.getByText('Index')).toBeVisible();
    await expect(page.getByText('Archive')).toBeVisible();
  });

  test('footer github link visible', async ({ page }) => {
    await page.goto('/zh/');
    const footer = page.locator('.footer-github');
    await expect(footer).toBeVisible();
  });

  test('theme toggle switches dark mode', async ({ page }) => {
    await page.goto('/zh/');
    const btn = page.locator('#themeToggle');
    await btn.click();
    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(theme).toBe('dark');
    await btn.click();
    const theme2 = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(theme2).toBeNull();
  });

  test('dark mode persists after refresh', async ({ page }) => {
    await page.goto('/zh/');
    await page.evaluate(() => localStorage.setItem('theme', 'dark'));
    await page.reload();
    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(theme).toBe('dark');
  });

  test('page wrapper max-width is 720px', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/zh/');
    const wrapper = page.locator('.page-wrapper');
    const box = await wrapper.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(720);
    }
  });

  test('dark mode persists across client-side navigation', async ({ page }) => {
    await page.goto('/zh/');
    await page.locator('#themeToggle').click();
    const before = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(before).toBe('dark');
    await page.locator('.post-title a, .post-item a, a[href*="/posts/"]').first().click();
    await page.waitForURL('**/posts/**');
    const after = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(after).toBe('dark');
  });

  test('mobile: header stacks vertically at 600px', async ({ page }) => {
    await page.setViewportSize({ width: 500, height: 800 });
    await page.goto('/zh/');
    const header = page.locator('header').first();
    const style = await header.evaluate(el => getComputedStyle(el).flexDirection);
    expect(style).toBe('column');
  });
});
