import { test, expect, type Page } from '@playwright/test';
const config = { campaign: '2026/27', preorder_until: '2026-11-15T23:00:00Z', preorder_price_cents: 8500, regular_price_cents: 9500, unit_price_cents: 8500, currency: 'EUR', ordering_open: true };
const receipt = { order_number: 'AK-7K3M9P', id: '12345678-1234-4234-8234-123456789abc', created_at: '2026-09-16T12:00:00Z', campaign: '2026/27', firstname: 'Ada', lastname: 'Lovelace', email: 'ada@example.com', street: 'Testweg', house_number: '2', zip: '01234', city: 'Berlin', country: 'DE', quantity: 2, unit_price_cents: 8500, total_cents: 17000, currency: 'EUR' };
async function fill(page: Page) {
  for (const [label,value] of [['Vorname','Ada'],['Nachname','Lovelace'],['E-Mail-Adresse','ada@example.com'],['Straße','Testweg'],['Hausnummer','2'],['PLZ','01234'],['Ort','Berlin']]) await page.getByLabel(label,{exact:true}).fill(value);
  await page.getByLabel('Anzahl 5l-Kartons').fill('2');
}
test.beforeEach(async ({ page }) => {
  // No test ever submits orders to a real Supabase instance.
  await page.route('https://**/*', route => route.abort());
  await page.route('**/functions/v1/orders-api/config', route => route.fulfill({ json: config }));
});
test('guest checkout without newsletter, saved confirmation and mobile layout', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  let submitted: any;
  await page.route('**/functions/v1/orders-api/order', async route => { submitted=route.request().postDataJSON(); await route.fulfill({status:201,json:{receipt}}); });
  await page.goto('/waitlist'); await expect(page).toHaveURL(/bestellen/);
  const prices = page.getByRole('region', { name: 'Preisübersicht' });
  const regularPrice = prices.locator('div').filter({ has: page.getByText('Regulärer Stückpreis', { exact: true }) }).locator('dd');
  const finalPrice = prices.locator('div').filter({ has: page.getByText('Gesamtbetrag', { exact: false }) }).locator('dd');
  await expect(regularPrice).toContainText('95,00');
  await expect(prices.getByText('− 10,00', { exact: false })).toBeVisible();
  await expect(finalPrice).toContainText('85,00');
  expect(await finalPrice.evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThan(
    await regularPrice.evaluate(el => parseFloat(getComputedStyle(el).fontSize)),
  );
  await fill(page);
  await expect(page.getByRole('checkbox')).toHaveCount(0);
  await expect(page.getByText('Möchtest Du über die nächste Ernte', { exact: false })).toHaveCount(0);
  await expect(page.getByText('170,00', {exact:false})).toBeVisible();
  await expect(prices.getByText('endet 15.11.2026', { exact: true })).toBeVisible();
  await expect(page.getByRole('button',{name:'Bestellung bestätigen'})).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({path:'test-results/order-mobile.png',fullPage:true});
  await page.setViewportSize({width:1280,height:900});
  await page.screenshot({path:'test-results/order-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await page.getByRole('button',{name:'Bestellung bestätigen'}).click();
  await expect(page.getByRole('heading',{name:'Deine Bestellung ist eingegangen.'})).toBeVisible();
  await expect(page.getByRole('link', { name: 'meyertiffertgbr@gmail.com' })).toHaveAttribute('href', /subject=Bestellung%20AK-7K3M9P/);
  await expect(page.getByText(receipt.id)).toHaveCount(0);
  expect(submitted).not.toHaveProperty('newsletter'); expect(submitted.quantity).toBe(2);
  await page.reload(); await expect(page.getByText(receipt.order_number)).toBeVisible();
  await page.screenshot({path:'test-results/receipt-mobile.png',fullPage:true});
});
test('quantity controls update liters and price with keyboard and reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/bestellen');
  const quantity = page.getByLabel('Anzahl 5l-Kartons');
  const less = page.getByRole('button', { name: 'Einen Karton weniger' });
  const more = page.getByRole('button', { name: 'Einen Karton mehr' });
  const prices = page.getByRole('region', { name: 'Preisübersicht' });
  await expect(less).toBeDisabled();
  await more.focus();
  await page.keyboard.press('Enter');
  await expect(quantity).toHaveValue('2');
  await expect(page.getByText('10 Liter Olivenöl', { exact: true })).toBeVisible();
  await expect(prices).toContainText('170,00');
  await expect(prices).toContainText(/Du sparst insgesamt 20,00\s€\./);
  await expect(prices.locator('.order-total')).toHaveCSS('animation-name', 'none');
  await less.click();
  await expect(quantity).toHaveValue('1');
  await expect(less).toBeDisabled();
  await expect(prices).toContainText(/Du sparst insgesamt 10,00\s€\./);
  await quantity.fill('');
  await more.click();
  await expect(quantity).toHaveValue('1');
  await quantity.fill('3');
  await expect(page.getByText('15 Liter Olivenöl', { exact: true })).toBeVisible();
  await expect(prices).toContainText('255,00');
  await expect(prices).toContainText(/Du sparst insgesamt 30,00\s€\./);
});

test('checkout works on mobile browsers without AbortSignal.timeout', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    Object.defineProperty(AbortSignal, 'timeout', { value: undefined, configurable: true });
  });
  await page.route('**/functions/v1/orders-api/order', route => route.fulfill({ status: 201, json: { receipt } }));
  await page.goto('/bestellen');
  await expect(page.getByRole('button', { name: 'Bestellung bestätigen' })).toBeEnabled();
  await expect(page.getByText('Der aktuelle Preis konnte nicht geladen werden.', { exact: false })).toHaveCount(0);
  await fill(page);
  await page.getByRole('button', { name: 'Bestellung bestätigen' }).click();
  await expect(page.getByRole('heading', { name: 'Deine Bestellung ist eingegangen.' })).toBeVisible();
});
test('checkout works on mobile browsers without crypto.randomUUID', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    Object.defineProperty(Crypto.prototype, 'randomUUID', { value: undefined, configurable: true });
  });
  let requestId = '';
  await page.route('**/functions/v1/orders-api/order', route => {
    requestId = route.request().postDataJSON().request_id;
    return route.fulfill({ status: 201, json: { receipt } });
  });
  await page.goto('/bestellen');
  await fill(page);
  await page.getByRole('button', { name: 'Bestellung bestätigen' }).click();
  await expect(page.getByRole('heading', { name: 'Deine Bestellung ist eingegangen.' })).toBeVisible();
  expect(requestId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});
test('price conflict requires explicit consent, with new request only after rejecting old quote', async ({ page }) => {
  const attempts: any[]=[];
  await page.route('**/functions/v1/orders-api/order', async route => {
    attempts.push(route.request().postDataJSON());
    await route.fulfill(attempts.length===1 ? {status:409,json:{error:'price_changed',unit_price_cents:9500}} : {status:201,json:{receipt:{...receipt,unit_price_cents:9500,total_cents:19000}}});
  });
  await page.goto('/bestellen'); await fill(page);
  await page.getByRole('button',{name:'Bestellung bestätigen'}).click();
  await expect(page.getByRole('alert')).toContainText('Preis hat sich geändert');
  await expect(page.getByText('Vorbestellrabatt', { exact: false })).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Preisübersicht' })).toContainText('190,00');
  await expect(page.getByRole('button',{name:'Bestellung bestätigen'})).toBeDisabled();
  await page.getByLabel('Ich bestätige den neuen Stückpreis',{exact:false}).check();
  await page.getByRole('button',{name:'Bestellung bestätigen'}).click();
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
  await page.getByRole('button',{name:'Bestellung bestätigen'}).click();
  await expect(page.getByRole('alert')).toContainText('nicht sicher abrufen');
  await expect(page.getByLabel('Vorname',{exact:true})).toBeDisabled();
  await page.reload(); await page.getByRole('button',{name:'Bestellstatus erneut prüfen'}).click();
  await expect(page.getByText(receipt.order_number)).toBeVisible(); expect(attempts[1]).toEqual(attempts[0]);
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
  await expect(page.getByText('endet 15.11.2026', { exact: true })).toBeVisible();
  await page.getByLabel('Anzahl 5l-Kartons').fill('3');
  await expect(page.getByText('255,00', {exact:false})).toBeVisible();
  await expect(page.getByRole('button',{name:'Vorschau – keine Bestellung'})).toBeDisabled();
  await expect(page.getByRole('alert')).toHaveCount(0);
  expect(requests).toBe(0);
});


test('saved legacy receipts retain their original reference', async ({ page }) => {
  const { order_number, ...legacy } = receipt;
  await page.addInitScript(value => sessionStorage.setItem('akria-order-receipt-v1', JSON.stringify(value)), legacy);
  await page.goto('/bestellen');
  await expect(page.getByText(receipt.id)).toBeVisible();
  await expect(page.getByRole('link', { name: 'meyertiffertgbr@gmail.com' })).toHaveAttribute('href', new RegExp(receipt.id));
});

test('saved checkout attempts from before removal retain their retry identity', async ({ page }) => {
  const legacyAttempt = { ...receipt, newsletter: true, expected_price_cents: 8500, source: 'website', website: '', request_id: crypto.randomUUID() };
  await page.addInitScript(value => sessionStorage.setItem('akria-order-attempt-v1', JSON.stringify(value)), legacyAttempt);
  let submitted: unknown;
  await page.route('**/functions/v1/orders-api/order', async route => {
    submitted = route.request().postDataJSON();
    await route.fulfill({ status: 201, json: { receipt } });
  });
  await page.goto('/bestellen');
  await expect(page.getByRole('checkbox')).toHaveCount(0);
  await page.getByRole('button', { name: 'Bestellstatus erneut prüfen' }).click();
  await expect(page.getByText(receipt.order_number)).toBeVisible();
  expect(submitted).toEqual(legacyAttempt);
});

test('product section displays the November deadline from checkout configuration', async ({ page }) => {
  await page.goto('/');
  const deadline = page.getByText('bis einschließlich 15.11.2026', { exact: false });
  await deadline.scrollIntoViewIfNeeded();
  await expect(deadline).toBeVisible();
  await expect(page.getByText('15.12.2026', { exact: false })).toHaveCount(0);
});

test('manual country is required, supports international postcodes and appears in receipt', async ({ page }) => {
  let submitted: any;
  await page.route('**/functions/v1/orders-api/order', async route => {
    submitted = route.request().postDataJSON();
    await route.fulfill({ status: 201, json: { receipt: { ...receipt, ...submitted } } });
  });
  await page.goto('/bestellen');
  await fill(page);
  await page.getByLabel('Land', { exact: true }).selectOption('OTHER');
  const manualCountry = page.getByLabel('Land manuell eingeben', { exact: true });
  await expect(manualCountry).toBeVisible();
  await page.getByRole('button', { name: 'Bestellung bestätigen' }).click();
  expect(submitted).toBeUndefined();
  await manualCountry.fill('Vereinigtes Königreich');
  await page.getByLabel('PLZ', { exact: true }).fill('SW1A 1AA');
  await page.getByRole('button', { name: 'Bestellung bestätigen' }).click();
  await expect(page.getByRole('heading', { name: 'Deine Bestellung ist eingegangen.' })).toBeVisible();
  expect(submitted.country).toBe('Vereinigtes Königreich');
  expect(submitted.zip).toBe('SW1A 1AA');
  await expect(page.getByText('Vereinigtes Königreich', { exact: false })).toBeVisible();
  await page.reload();
  await expect(page.getByText('Vereinigtes Königreich', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Weitere Bestellung aufgeben' }).click();
  await expect(page.getByLabel('Land', { exact: true })).toHaveValue('DE');
  await expect(manualCountry).toHaveCount(0);
});

test('switching back to Germany restores its postcode validation', async ({ page }) => {
  await page.goto('/bestellen');
  const country = page.getByLabel('Land', { exact: true });
  await country.selectOption('OTHER');
  await page.getByLabel('Land manuell eingeben').fill('Österreich');
  await page.getByLabel('PLZ', { exact: true }).fill('1010');
  await country.selectOption('DE');
  await expect(page.getByLabel('Land manuell eingeben')).toHaveCount(0);
  expect(await page.getByLabel('PLZ', { exact: true }).evaluate((el: HTMLInputElement) => el.validity.patternMismatch)).toBe(true);
});
