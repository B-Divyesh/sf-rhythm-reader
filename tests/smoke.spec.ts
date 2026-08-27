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
