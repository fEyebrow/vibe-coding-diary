import { test, expect } from '@playwright/test';

test.describe('Phase 6: RSS', () => {
  test('zh rss.xml returns 200 with xml content', async ({ page }) => {
    const response = await page.goto('/zh/rss.xml');
    expect(response?.status()).toBe(200);
    const contentType = response?.headers()['content-type'] ?? '';
    expect(contentType).toContain('xml');
  });

  test('zh rss contains zh post titles', async ({ page }) => {
    await page.goto('/zh/rss.xml');
    const content = await page.content();
    expect(content).toContain('架构的留白');
  });

  test('en rss.xml returns 200', async ({ page }) => {
    const response = await page.goto('/en/rss.xml');
    expect(response?.status()).toBe(200);
  });

  test('en rss contains en post titles', async ({ page }) => {
    await page.goto('/en/rss.xml');
    const content = await page.content();
    expect(content).toContain('Whitespace');
  });

  test('zh rss has required tags', async ({ page }) => {
    await page.goto('/zh/rss.xml');
    const content = await page.content();
    expect(content).toContain('<title>');
    expect(content).toContain('<pubDate>');
    expect(content).toContain('<description>');
    expect(content).toContain('<link>');
  });
});
