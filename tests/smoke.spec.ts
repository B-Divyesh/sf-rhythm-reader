import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('mobile shell is accessible and every visible interactive target is at least 44 CSS pixels', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  expect(await page.locator('html').getAttribute('lang')).toBe('en');
  expect(await page.locator('main').count()).toBe(1);
  expect(await page.locator('h1').count()).toBe(1);
  expect(errors).toEqual([]);

  const targets = await page.locator('a, button, input, select').evaluateAll((elements) => elements
    .filter((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      // Radio choices use their 44px labelled cassette-switch surface; their
      // visually-hidden native input is not a separately exposed touch target.
      return !(element instanceof HTMLInputElement && element.type === 'radio') && style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
    })
    .map((element) => {
      const rect = element.getBoundingClientRect();
      return { label: (element.textContent || element.getAttribute('aria-label') || element.tagName).trim(), width: rect.width, height: rect.height };
    }));
  expect(targets.filter((target) => target.width < 44 || target.height < 44)).toEqual([]);

  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
});

test('parseable malformed saved settings and history recover without blanking the trainer', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    if (sessionStorage.getItem('storage-recovery-seeded')) return;
    sessionStorage.setItem('storage-recovery-seeded', 'yes');
    localStorage.setItem('rr_settings:v1', JSON.stringify({
      meter: '999', style: 'not-a-style', bars: '∞', tempo: 'fast', difficulty: 99,
      lockLevel: 'maybe', inputMode: 'unknown', calibrationMs: 'NaN',
    }));
    localStorage.setItem('rr_history:v1', '{}');
  });

  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('#tempo')).toHaveValue('84');
  await expect(page.locator('#storage-recovery')).toContainText(/repaired/i);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('rr_settings:v1'))).toBe(JSON.stringify({
    meter: '4/4', style: 'folk', bars: 2, tempo: 84, difficulty: 2,
    lockLevel: true, inputMode: 'tap', calibrationMs: 0,
  }));
  await expect.poll(() => page.evaluate(() => localStorage.getItem('rr_history:v1'))).toBe('[]');

  await page.evaluate(() => localStorage.setItem('rr_history:v1', JSON.stringify([
    null,
    { date: new Date().toISOString().slice(0, 10), drills: 2, best: 91 },
    { date: '2026-02-30', drills: 1, best: 100 },
  ])));
  await page.reload();
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('.tap-pad')).toBeVisible();
  await expect(page.locator('#storage-recovery')).toContainText(/repaired/i);
  const today = await page.evaluate(() => new Date().toISOString().slice(0, 10));
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('rr_history:v1') ?? 'null'))).toEqual([
    { date: today, drills: 2, best: 91 },
  ]);
  expect(errors).toEqual([]);
});
