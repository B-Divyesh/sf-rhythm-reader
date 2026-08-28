import { expect, test } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

async function waitForControl(page: import('@playwright/test').Page, path = '/'): Promise<void> {
  await page.goto(path);
  await expect(page.locator('h1')).toBeVisible();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
}

test('a fresh install reloads the complete trainer offline without an HTML asset fallback', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await waitForControl(page);

  const cacheEntries = await page.evaluate(async () => {
    const names = await caches.keys();
    const cache = await caches.open(names.find((name) => name.startsWith('rhythm-reader-'))!);
    return (await cache.keys()).map((request) => new URL(request.url).pathname);
  });
  expect(cacheEntries).toEqual(expect.arrayContaining(['/index.html']));
  expect(cacheEntries.some((path) => /^\/assets\/.*\.(?:js|css)$/u.test(path))).toBe(true);

  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('h1')).toHaveText(/Practice reading rhythms/i);
  await expect(page.locator('.tap-pad')).toBeVisible();
  const missingAsset = await page.evaluate(() => fetch('/assets/not-in-precache.js').then((response) => response.headers.get('content-type') ?? 'response', () => 'failed'));
  expect(missingAsset).not.toContain('text/html');
  expect(pageErrors).toEqual([]);
  await context.close();
});

test('an old controlled client shows and explicitly activates an update', async ({ browser }) => {
  const workerPath = resolve('dist/sw.js');
  const original = await readFile(workerPath, 'utf8');
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await waitForControl(page);
    const before = await page.evaluate(() => caches.keys());
    const updated = original.replace(/const RELEASE = "([^"]+)";/u, 'const RELEASE = "$1-update-test";');
    expect(updated).not.toBe(original);
    await writeFile(workerPath, updated);

    await page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.update());
    const updateButton = page.getByRole('button', { name: 'Reload the update' });
    await expect(updateButton).toBeVisible();
    await updateButton.click();
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null && !document.querySelector('#app-update:not([hidden])'));
    await expect(page.locator('h1')).toBeVisible();
    const after = await page.evaluate(() => caches.keys());
    expect(after).not.toEqual(before);
    expect(after.some((name) => name.endsWith('-update-test'))).toBe(true);
  } finally {
    await writeFile(workerPath, original);
    await context.close();
  }
});
