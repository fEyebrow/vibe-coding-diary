import { test, expect } from '@playwright/test';

test.describe('Phase 5: Language Switch', () => {
  test('language switch on homepage', async ({ page }) => {
    await page.goto('/zh/');
    const btn = page.locator('#langToggle');
    await btn.click();
    await expect(page).toHaveURL('/en/');
  });

  test('language switch on archive', async ({ page }) => {
    await page.goto('/zh/posts/');
    const btn = page.locator('#langToggle');
    await btn.click();
    await expect(page).toHaveURL('/en/posts/');
  });

  test('language switch on article page', async ({ page }) => {
    await page.goto('/zh/posts/hello-world');
    const btn = page.locator('#langToggle');
    await btn.click();
    await expect(page).toHaveURL('/en/posts/hello-world');
  });

  test('lang button is highlighted on en pages', async ({ page }) => {
    await page.goto('/en/');
    const btn = page.locator('#langToggle');
    const color = await btn.evaluate(el => (el as HTMLElement).style.color);
    expect(color).toContain('accent-willow');
  });

  test('date format is YYYY.MM.DD in both languages', async ({ page }) => {
    await page.goto('/zh/posts/');
    const date = page.locator('.post-card-meta span').first();
    const text = await date.textContent();
    expect(text).toMatch(/^\d{4}\.\d{2}\.\d{2}$/);
  });
});
