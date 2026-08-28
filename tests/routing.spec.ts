import { expect, test } from '@playwright/test';

const routes = [
  ['/', 'Rhythm Reader — tap rhythm reading practice', 'Practice reading rhythms by tapping them'],
  ['/demo', 'Demo — Rhythm Reader', 'See a scored two-bar rhythm'],
  ['/privacy', 'Privacy — Rhythm Reader', 'Privacy'],
  ['/terms', 'Terms — Rhythm Reader', 'Terms'],
  ['/missing-tape', 'Page not found — Rhythm Reader', 'This page missed the beat'],
] as const;

for (const [path, title, heading] of routes) {
  test(`${path} is a real route with metadata and the shared shell`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText(heading);
    await expect(page.locator('header .wordmark')).toBeVisible();
    await expect(page.locator('footer').getByRole('link', { name: 'Privacy' })).toBeVisible();
    await expect(page.locator('footer').getByRole('link', { name: 'Terms' })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\/rhythm-reader\.sociobot\.in\//u);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /rhythm-reader-social\.jpg$/u);
  });
}

test('client navigation, back, and forward restore the route and focus its heading', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Demo', exact: true }).click();
  await expect(page).toHaveURL(/\/demo$/u);
  await expect(page.locator('h1')).toBeFocused();
  await page.getByRole('link', { name: 'Privacy', exact: true }).first().click();
  await expect(page.locator('h1')).toHaveText('Privacy');
  await expect(page.locator('h1')).toBeFocused();
  await page.goBack();
  await expect(page.locator('h1')).toHaveText('See a scored two-bar rhythm');
  await expect(page.locator('h1')).toBeFocused();
  await page.goForward();
  await expect(page.locator('h1')).toHaveText('Privacy');
});

test('crawler assets return their real content types and bodies', async ({ request }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.ok()).toBe(true);
  expect(robots.headers()['content-type']).toContain('text/plain');
  expect(await robots.text()).toContain('Sitemap:');
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.ok()).toBe(true);
  expect(sitemap.headers()['content-type']).toMatch(/xml/u);
  expect(await sitemap.text()).toContain('<urlset');
  const icon = await request.get('/apple-touch-icon.png');
  expect(icon.ok()).toBe(true);
  expect(icon.headers()['content-type']).toContain('image/png');
  expect((await icon.body()).byteLength).toBeGreaterThan(1000);
});

test('the 390px first screen has the job, audience, demo action, and no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.getByText(/For adult pianists/)).toBeVisible();
  const action = page.getByRole('link', { name: 'Try it with sample data' });
  await expect(action).toBeVisible();
  expect((await action.boundingBox())!.y).toBeLessThan(844);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});
