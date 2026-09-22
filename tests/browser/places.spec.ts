import { test, expect } from '@playwright/test';

const components = [
  { longText: 'Bahnhofstrasse', types: ['route'] }, { longText: '12', types: ['street_number'] },
  { longText: '8001', types: ['postal_code'] }, { longText: 'Zürich', types: ['locality'] },
  { longText: 'Schweiz', shortText: 'CH', types: ['country'] },
];
test.beforeEach(async ({ page }) => {
  await page.route('https://**/*', route => route.abort());
  await page.route('**/functions/v1/orders-api/config', route => route.fulfill({ json: { campaign: '2026/27', unit_price_cents: 8500, regular_price_cents: 9500, preorder_until: '2026-11-15T23:00:00Z', currency: 'EUR', ordering_open: true } }));
});
async function google(page: import('@playwright/test').Page, missingNumber = false, delay = 0) {
  await page.route('https://maps.googleapis.com/maps/api/js?**', route => route.fulfill({ contentType: 'application/javascript', body: `
    window.google = { maps: { importLibrary: async () => ({
      AutocompleteSessionToken: class {},
      AutocompleteSuggestion: { fetchAutocompleteSuggestions: async (request) => {
        window.placesRequest = request;
        return { suggestions: [{ placePrediction: {
          text: { toString: () => 'Bahnhofstrasse 12, 8001 Zürich, Schweiz' },
          toPlace: () => ({ addressComponents: ${JSON.stringify(missingNumber ? components.filter(c => !c.types.includes('street_number')) : components)},
            fetchFields: async () => new Promise(resolve => setTimeout(resolve, ${delay})) })
        }}] };
      }}
    }) } }; window.akriaPlacesReady();
  ` }));
}
test('Swiss address selection fills existing fields and remains editable', async ({ page }) => {
  await google(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/bestellen');
  const street = page.getByLabel('Straße', { exact: true });
  await street.fill('Bahnhof');
  await expect(page.getByRole('listbox', { name: 'Adressvorschläge' }).getByRole('option')).toBeVisible();
  await page.screenshot({ path: 'test-results/places-mobile.png', fullPage: true });
  await street.press('ArrowDown'); await street.press('Enter');
  await expect(street).toHaveValue('Bahnhofstrasse');
  for (const [label, value] of [['Hausnummer', '12'], ['PLZ', '8001'], ['Ort', 'Zürich'], ['Land', 'CH']]) await expect(page.getByLabel(label, { exact: true })).toHaveValue(value);
  await page.getByLabel('Hausnummer', { exact: true }).fill('14');
  await expect(page.getByLabel('Hausnummer', { exact: true })).toHaveValue('14');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
test('street-only result clears the previous house number', async ({ page }) => {
  await google(page, true);
  await page.goto('/bestellen');
  await page.getByLabel('Hausnummer', { exact: true }).fill('99');
  await page.getByLabel('Straße', { exact: true }).fill('Bahnhof');
  await page.getByRole('listbox', { name: 'Adressvorschläge' }).getByRole('option').click();
  await expect(page.getByLabel('PLZ', { exact: true })).toHaveValue('8001');
  await expect(page.getByLabel('Hausnummer', { exact: true })).toHaveValue('');
});
test('Google failure leaves manual checkout usable', async ({ page }) => {
  await page.goto('/bestellen');
  await page.getByLabel('Straße', { exact: true }).fill('Manueller Weg');
  await expect(page.getByText('Adressvorschläge sind gerade nicht verfügbar.', { exact: false })).toBeVisible();
  await expect(page.getByLabel('Straße', { exact: true })).toHaveValue('Manueller Weg');
  await expect(page.getByRole('button', { name: 'Bestellung bestätigen' })).toBeEnabled();
});
test('late details cannot overwrite newer manual input', async ({ page }) => {
  await google(page, false, 700);
  await page.goto('/bestellen');
  const street = page.getByLabel('Straße', { exact: true });
  await street.fill('Bahnhof'); await page.getByRole('listbox', { name: 'Adressvorschläge' }).getByRole('option').click();
  await street.fill('Neue Straße');
  await page.waitForTimeout(900);
  await expect(street).toHaveValue('Neue Straße');
  await expect(page.getByLabel('Land', { exact: true })).toHaveValue('DE');
});
