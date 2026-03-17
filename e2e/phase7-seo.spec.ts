import { test, expect } from '@playwright/test';

test.describe('Phase 7: SEO', () => {
  test('homepage has title', async ({ page }) => {
    await page.goto('/zh/');
    await expect(page).toHaveTitle('Vibe Coding Diary');
  });

  test('homepage has description meta', async ({ page }) => {
    await page.goto('/zh/');
    const meta = page.locator('meta[name="description"]');
    const content = await meta.getAttribute('content');
    expect(content).toBeTruthy();
    expect(content!.length).toBeGreaterThan(10);
  });

  test('article page has correct title', async ({ page }) => {
    await page.goto('/zh/posts/hello-world');
    const title = await page.title();
    expect(title).toContain('Vibe Coding Diary');
    expect(title).toContain('架构的留白');
  });

  test('pages have hreflang links', async ({ page }) => {
    await page.goto('/zh/');
    const hreflangZh = page.locator('link[hreflang="zh"]');
    const hreflangEn = page.locator('link[hreflang="en"]');
    const hreflangDefault = page.locator('link[hreflang="x-default"]');
    await expect(hreflangZh).toHaveCount(1);
    await expect(hreflangEn).toHaveCount(1);
    await expect(hreflangDefault).toHaveCount(1);
  });

  test('pages have og meta tags', async ({ page }) => {
    await page.goto('/zh/posts/hello-world');
    const ogTitle = page.locator('meta[property="og:title"]');
    const ogDesc = page.locator('meta[property="og:description"]');
    const ogType = page.locator('meta[property="og:type"]');
    await expect(ogTitle).toHaveCount(1);
    await expect(ogDesc).toHaveCount(1);
    await expect(ogType).toHaveCount(1);
  });

  test('uses semantic html', async ({ page }) => {
    await page.goto('/zh/posts/hello-world');
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('article')).toHaveCount(1);
    await expect(page.locator('header').first()).toBeVisible();
    await expect(page.locator('footer').first()).toBeVisible();
    await expect(page.locator('nav').first()).toBeVisible();
  });

  test('rss autodiscovery link in head', async ({ page }) => {
    await page.goto('/zh/');
    const rssLink = page.locator('link[type="application/rss+xml"]');
    await expect(rssLink).toHaveCount(1);
    const href = await rssLink.getAttribute('href');
    expect(href).toContain('/zh/rss.xml');
  });
});
