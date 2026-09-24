import { test, expect } from '@playwright/test';

const config = { campaign: '2026/27', preorder_until: '2026-11-15T23:00:00Z', preorder_price_cents: 8500, regular_price_cents: 9500, unit_price_cents: 8500, currency: 'EUR', ordering_open: true };

test('landing price refresh is shared, throttled and paused in hidden tabs', async ({ page }) => {
  await page.route('https://**/*', route => route.abort());
  let calls = 0;
  await page.route('**/functions/v1/orders-api/config', route => {
    calls++;
    return route.fulfill({ json: config });
  });
  await page.clock.install();
  await page.goto('/');
  await expect.poll(() => calls).toBe(1);
  await page.evaluate(() => { for (let i = 0; i < 5; i++) window.dispatchEvent(new Event('focus')); });
  await page.clock.fastForward('04:59');
  expect(calls).toBe(1);
  await page.clock.fastForward('00:01');
  await expect.poll(() => calls).toBe(2);

  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.clock.fastForward('30:00');
  expect(calls).toBe(2);
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    document.dispatchEvent(new Event('visibilitychange'));
    window.dispatchEvent(new Event('focus'));
  });
  await expect.poll(() => calls).toBe(3);

  // The checkout must still fetch a fresh price independently of the landing cache.
  await page.getByRole('link', { name: /vorbestellen|bestellen/i }).first().click();
  await expect(page).toHaveURL(/bestellen/);
  await expect(page.getByRole('button', { name: 'Bestellung bestätigen' })).toBeEnabled();
  expect(calls).toBeGreaterThan(3);
  const checkoutCalls = calls;
  await page.clock.fastForward('10:00');
  expect(calls).toBe(checkoutCalls);
});

test('failed landing requests are not retried on every focus event', async ({ page }) => {
  await page.route('https://**/*', route => route.abort());
  let calls = 0;
  await page.route('**/functions/v1/orders-api/config', route => {
    calls++;
    return route.fulfill(calls === 1 ? { status: 503, json: { error: 'temporarily_unavailable' } } : { json: config });
  });
  await page.clock.install();
  await page.goto('/');
  await expect.poll(() => calls).toBe(1);
  await page.evaluate(() => { for (let i = 0; i < 5; i++) window.dispatchEvent(new Event('focus')); });
  await page.clock.fastForward('04:59');
  expect(calls).toBe(1);
  await page.clock.fastForward('00:01');
  await expect.poll(() => calls).toBe(2);
});
