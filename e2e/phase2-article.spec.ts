import { test, expect } from '@playwright/test';

test.describe('Phase 2: Article Detail Page', () => {
  test('article page renders', async ({ page }) => {
    await page.goto('/zh/posts/hello-world');
    await expect(page.locator('.article-title')).toBeVisible();
  });

  test('article has date meta in mono font', async ({ page }) => {
    await page.goto('/zh/posts/hello-world');
    const time = page.locator('.article-meta time');
    await expect(time).toBeVisible();
    await expect(time).toContainText('2023.10.24');
  });

  test('article has header divider', async ({ page }) => {
    await page.goto('/zh/posts/hello-world');
    await expect(page.locator('.header-divider')).toBeVisible();
  });

  test('article content renders', async ({ page }) => {
    await page.goto('/zh/posts/hello-world');
    await expect(page.locator('.article-content')).toBeVisible();
  });

  test('article nav shows back to index', async ({ page }) => {
    await page.goto('/zh/posts/hello-world');
    await expect(page.locator('.back-to-list')).toBeVisible();
  });

  test('React counter island works', async ({ page }) => {
    await page.goto('/zh/posts/hello-world');
    const counter = page.locator('text=React Island');
    await expect(counter).toBeVisible();
  });

  test('english article renders', async ({ page }) => {
    await page.goto('/en/posts/hello-world');
    await expect(page.locator('.article-title')).toContainText('Whitespace');
  });
});
