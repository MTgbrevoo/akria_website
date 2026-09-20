import { test, expect, type Page } from '@playwright/test';
const config = { campaign: '2026/27', preorder_until: '2026-12-15T23:00:00Z', preorder_price_cents: 8500, regular_price_cents: 9500, unit_price_cents: 8500, currency: 'EUR', ordering_open: true };
const receipt = { id: '12345678-1234-4234-8234-123456789abc', created_at: '2026-09-16T12:00:00Z', campaign: '2026/27', firstname: 'Ada', lastname: 'Lovelace', email: 'ada@example.com', street: 'Testweg', house_number: '2', zip: '01234', city: 'Berlin', country: 'DE', quantity: 2, unit_price_cents: 8500, total_cents: 17000, currency: 'EUR' };
async function fill(page: Page) {
  for (const [label,value] of [['Vorname','Ada'],['Nachname','Lovelace'],['E-Mail-Adresse','ada@example.com'],['Straße','Testweg'],['Hausnummer','2'],['PLZ','01234'],['Ort','Berlin']]) await page.getByLabel(label,{exact:true}).fill(value);
  await page.getByLabel('Anzahl 5-Liter-Bag-in-Box').fill('2');
}
test.beforeEach(async ({ page }) => {
  // No test ever submits orders to a real Supabase instance.
  await page.route('https://**/*', route => route.abort());
  await page.route('**/functions/v1/orders-api/config', route => route.fulfill({ json: config }));
});
test('guest checkout, optional newsletter, saved confirmation and mobile layout', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  let submitted: any;
  await page.route('**/functions/v1/orders-api/order', async route => { submitted=route.request().postDataJSON(); await route.fulfill({status:201,json:{receipt}}); });
  await page.goto('/waitlist'); await expect(page).toHaveURL(/bestellen/);
  await fill(page);
  await expect(page.getByRole('checkbox')).not.toBeChecked();
  await expect(page.getByText('170,00', {exact:false})).toBeVisible();
  await expect(page.getByRole('button',{name:'Zahlungspflichtig bestellen'})).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({path:'test-results/order-mobile.png',fullPage:true});
  await page.getByRole('button',{name:'Zahlungspflichtig bestellen'}).click();
  await expect(page.getByRole('heading',{name:'Deine Bestellung ist eingegangen.'})).toBeVisible();
  expect(submitted.newsletter).toBe(false); expect(submitted.quantity).toBe(2);
  await page.reload(); await expect(page.getByText(receipt.id)).toBeVisible();
  await page.screenshot({path:'test-results/receipt-mobile.png',fullPage:true});
});
test('checkout works on mobile browsers without AbortSignal.timeout', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    Object.defineProperty(AbortSignal, 'timeout', { value: undefined, configurable: true });
  });
  await page.route('**/functions/v1/orders-api/order', route => route.fulfill({ status: 201, json: { receipt } }));
  await page.goto('/bestellen');
  await expect(page.getByRole('button', { name: 'Zahlungspflichtig bestellen' })).toBeEnabled();
  await expect(page.getByText('Der aktuelle Preis konnte nicht geladen werden.', { exact: false })).toHaveCount(0);
  await fill(page);
  await page.getByRole('button', { name: 'Zahlungspflichtig bestellen' }).click();
  await expect(page.getByRole('heading', { name: 'Deine Bestellung ist eingegangen.' })).toBeVisible();
});
test('price conflict requires explicit consent, with new request only after rejecting old quote', async ({ page }) => {
  const attempts: any[]=[];
  await page.route('**/functions/v1/orders-api/order', async route => {
    attempts.push(route.request().postDataJSON());
    await route.fulfill(attempts.length===1 ? {status:409,json:{error:'price_changed',unit_price_cents:9500}} : {status:201,json:{receipt:{...receipt,unit_price_cents:9500,total_cents:19000}}});
  });
  await page.goto('/bestellen'); await fill(page);
  await page.getByRole('button',{name:'Zahlungspflichtig bestellen'}).click();
  await expect(page.getByRole('alert')).toContainText('Preis hat sich geändert');
  await expect(page.getByRole('button',{name:'Zahlungspflichtig bestellen'})).toBeDisabled();
  await page.getByLabel('Ich bestätige den neuen Stückpreis',{exact:false}).check();
  await page.getByRole('button',{name:'Zahlungspflichtig bestellen'}).click();
  await expect(page.getByRole('heading',{name:'Deine Bestellung ist eingegangen.'})).toBeVisible();
  expect(attempts[1].expected_price_cents).toBe(9500); expect(attempts[1].request_id).not.toBe(attempts[0].request_id);
});
test('ambiguous network outcome survives reload and retries identical request', async ({ page }) => {
  const attempts: any[]=[];
  await page.route('**/functions/v1/orders-api/order', async route => {
    attempts.push(route.request().postDataJSON());
    if(attempts.length===1) await route.abort(); else await route.fulfill({status:201,json:{receipt}});
  });
  await page.goto('/bestellen'); await fill(page);
  await page.getByRole('button',{name:'Zahlungspflichtig bestellen'}).click();
  await expect(page.getByRole('alert')).toContainText('nicht sicher abrufen');
  await expect(page.getByLabel('Vorname',{exact:true})).toBeDisabled();
  await page.reload(); await page.getByRole('button',{name:'Bestellstatus erneut prüfen'}).click();
  await expect(page.getByText(receipt.id)).toBeVisible(); expect(attempts[1]).toEqual(attempts[0]);
});
test('newsletter link opening never confirms automatically', async ({ page }) => {
  let calls=0;
  await page.route('**/functions/v1/orders-api/newsletter', async route => { calls++; await route.fulfill({json:{ok:true}}); });
  await page.goto(`/newsletter#action=confirm&token=${'a'.repeat(64)}`);
  await expect(page.getByRole('button',{name:'Ja, ich möchte informiert werden'})).toBeVisible();
  expect(page.url()).not.toContain('token='); expect(calls).toBe(0);
  await page.getByRole('button',{name:'Ja, ich möchte informiert werden'}).click();
  await expect(page.getByRole('heading',{name:'Du bist dabei!'})).toBeVisible(); expect(calls).toBe(1);
});
test('local preview shows price without a backend and cannot submit orders', async ({ page }) => {
  let requests=0;
  await page.route('**/functions/v1/orders-api/**', async route => { requests++; await route.abort(); });
  await page.goto('/bestellen?vorschau=1');
  await expect(page.getByText('Lokale Vorschau', {exact:false})).toBeVisible();
  await page.getByLabel('Anzahl 5-Liter-Bag-in-Box').fill('3');
  await expect(page.getByText('255,00', {exact:false})).toBeVisible();
  await expect(page.getByRole('button',{name:'Vorschau – keine Bestellung'})).toBeDisabled();
  await expect(page.getByRole('alert')).toHaveCount(0);
  expect(requests).toBe(0);
});
