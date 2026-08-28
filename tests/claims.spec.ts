import { expect, test } from '@playwright/test';
import { scoreTaps } from '../src/scoring';

test('@claim:timing-feedback the sample shows a score and every timing mark', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'See a scored two-bar rhythm' })).toBeVisible();
  await expect(page.locator('.result-sheet')).toContainText('%');
  await expect(page.locator('.timing--early').first()).toBeVisible();
  await expect(page.locator('.timing--on').first()).toBeVisible();
  await expect(page.locator('.timing--late').first()).toBeVisible();
  await expect(page.locator('.timing--missed').first()).toBeVisible();
});

test('@claim:demo-isolation demo settings never read or overwrite real practice data', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('rr_settings:v1', JSON.stringify({ meter: '3/4', style: 'march', bars: 4, tempo: 100, difficulty: 4, lockLevel: false, inputMode: 'tap', calibrationMs: 20 }));
    localStorage.setItem('rr_history:v1', JSON.stringify([{ date: '2026-08-28', drills: 9, best: 99 }]));
  });
  await page.goto('/?demo=1');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('#meter')).toHaveValue('4/4');
  await page.locator('#meter').selectOption('6/8');
  const beforeReset = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map((key) => [key, localStorage.getItem(key)])));
  expect(JSON.parse(beforeReset['rr_settings:v1'] ?? '{}').meter).toBe('3/4');
  expect(JSON.parse(beforeReset['demo:rr_settings:v1'] ?? '{}').meter).toBe('6/8');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('#meter')).toHaveValue('4/4');
  const afterReset = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map((key) => [key, localStorage.getItem(key)])));
  expect(JSON.parse(afterReset['rr_settings:v1'] ?? '{}').meter).toBe('3/4');
  expect(JSON.parse(afterReset['rr_history:v1'] ?? '[]')[0].drills).toBe(9);
  expect(Object.keys(afterReset).filter((key) => key.startsWith('demo:')).sort()).toEqual(['demo:rr_history:v1', 'demo:rr_settings:v1']);

  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveURL('/');
  const afterExit = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map((key) => [key, localStorage.getItem(key)])));
  expect(Object.keys(afterExit).filter((key) => key.startsWith('demo:'))).toEqual([]);
  expect(afterExit['rr_settings:v1']).toBe(beforeReset['rr_settings:v1']);
  expect(afterExit['rr_history:v1']).toBe(beforeReset['rr_history:v1']);
});

test('@claim:offline-reload the demo reloads after the first visit without a network', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/demo');
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await context.setOffline(true);
  await page.reload();
  await expect(page).toHaveTitle('Demo — Rhythm Reader');
  await expect(page.locator('.result-sheet')).toBeVisible();
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await context.close();
});

test('@claim:privacy-local-only the complete sample flow sends no cross-origin requests', async ({ page }) => {
  const externalRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') externalRequests.push(request.url());
  });
  await page.goto('/demo');
  await page.locator('#style').selectOption('swing');
  await page.getByRole('button', { name: /Use microphone claps/ }).click();
  await expect(page.getByRole('button', { name: /Use keyboard or screen taps/ })).toBeVisible();
  await page.getByRole('button', { name: /Start rhythm practice/ }).click();
  await expect(page.locator('.deck')).toHaveAttribute('data-phase', 'counting');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.waitForTimeout(200);
  expect(externalRequests).toEqual([]);
  expect(await page.evaluate(() => Object.keys(localStorage).every((key) => key.startsWith('demo:')))).toBe(true);
  expect(await page.evaluate(() => Object.values(localStorage).every((value) => !String(value).startsWith('data:audio')))).toBe(true);
  await expect(page.locator('body')).not.toContainText(/sign in|create account|advertisement/i);
});

test('@claim:input-calibration screen, keyboard, microphone, and timing adjustment work and persist', async ({ page }) => {
  test.setTimeout(30_000);
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      const context = new AudioContext();
      const output = context.createMediaStreamDestination();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = 880;
      gain.gain.value = .2;
      oscillator.connect(gain).connect(output);
      oscillator.start();
      return output.stream;
    };
  });
  await page.goto('/demo');
  await expect(page.getByRole('button', { name: /Start rhythm practice/ })).toBeVisible();
  await page.locator('#meter').selectOption('3/4');
  await page.locator('#tempo').fill('160');
  await page.keyboard.press('Space');
  await expect(page.locator('.deck')).toHaveAttribute('data-phase', 'counting');
  await expect(page.locator('.deck')).toHaveAttribute('data-phase', 'playing');
  await page.getByRole('button', { name: 'Tap the rhythm' }).click();
  await expect.poll(async () => Number((await page.locator('.counter').textContent())?.match(/\d+/u)?.[0] ?? 0)).toBeGreaterThan(0);
  await page.reload();
  await page.getByRole('button', { name: 'Use microphone claps' }).click();
  await expect(page.getByRole('button', { name: 'Use keyboard or screen taps' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: /Start rhythm practice/ }).click();
  await expect(page.locator('.deck')).toHaveAttribute('data-phase', 'playing');
  await expect.poll(async () => Number((await page.locator('.counter').textContent())?.match(/\d+/u)?.[0] ?? 0)).toBeGreaterThan(0);

  await page.reload();
  await page.getByRole('button', { name: /Adjust tap timing/ }).click();
  const calibration = page.getByRole('button', { name: 'Start timing adjustment' });
  await calibration.click();
  for (let index = 0; index < 6; index += 1) {
    await page.waitForTimeout(index === 0 ? 810 : 650);
    await page.getByRole('button', { name: 'Tap with the click' }).click();
  }
  await expect(page.getByRole('dialog')).toContainText(/Saved timing adjustment: [+-]?\d+ ms\./u, { timeout: 3_000 });
  const savedAdjustment = await page.evaluate(() => JSON.parse(localStorage.getItem('demo:rr_settings:v1') ?? '{}').calibrationMs as number);
  expect(Math.abs(savedAdjustment)).toBeGreaterThan(70);
  await page.reload();
  await expect(page.getByRole('button', { name: new RegExp(`Adjust tap timing \\(${savedAdjustment > 0 ? '\\+' : ''}${savedAdjustment} ms\\)`) })).toBeVisible();

  const expected = [1000];
  // A 1-second beat keeps even the intentionally delayed, clamped sample inside
  // the matching window. This is the same scoring function used by the trainer.
  const rawGap = scoreTaps(expected, [1000 + savedAdjustment], 1000, 0).notes[0].offsetMs;
  const correctedGap = scoreTaps(expected, [1000 + savedAdjustment], 1000, savedAdjustment).notes[0].offsetMs;
  expect(rawGap).toBe(savedAdjustment);
  expect(correctedGap).toBe(0);
});

test('@claim:rhythm-options all listed signatures, lengths, and rhythm styles can be selected', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('#meter option')).toHaveCount(3);
  await page.locator('#meter').selectOption('6/8');
  await expect(page.locator('#meter')).toHaveValue('6/8');
  await page.getByRole('radio', { name: '4 bars' }).check();
  await expect(page.getByRole('radio', { name: '4 bars' })).toBeChecked();
  await expect(page.locator('#style option')).toHaveCount(5);
  for (const style of ['folk', 'march', 'pop', 'swing', 'clave']) {
    await page.locator('#style').selectOption(style);
    await expect(page.locator('#style')).toHaveValue(style);
  }
});

test('@claim:free-no-account the full trainer has no payment or account gate', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Free to use. No account.')).toBeVisible();
  await expect(page.locator('a[href*="checkout"], input[type="email"], input[type="password"]')).toHaveCount(0);
  await expect(page.locator('#style option:disabled')).toHaveCount(0);
});

test('@claim:scope-boundaries feedback is limited to tap timing', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Timing practice, not music grading.' })).toBeVisible();
  await page.goto('/demo');
  await expect(page.locator('.timing')).toHaveCount(await page.locator('.note').count());
  await expect(page.locator('input[type="file"], [data-input="midi"], [data-input="pitch"], [data-input="song"]')).toHaveCount(0);
});

test('@claim:art-provenance the original art source and disclosure ship together', async ({ page }) => {
  const { readFile } = await import('node:fs/promises');
  const prompt = JSON.parse(await readFile('assets/src/rhythm-cassette.prompt.json', 'utf8')) as Record<string, unknown>;
  const design = await readFile('.factory/design.md', 'utf8');
  expect(JSON.stringify(prompt).length).toBeGreaterThan(200);
  expect(design).toContain('factory Azure OpenAI image deployment');
  await page.goto('/');
  await expect(page.locator('.hero-art img')).toHaveAttribute('src', '/art/rhythm-cassette.webp');
  await expect(page.locator('footer')).toContainText('Collage created for Rhythm Reader with AI assistance.');
});
