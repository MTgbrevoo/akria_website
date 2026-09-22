import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateOrder, mailContent, createHandler, sha256 } from '../supabase/functions/orders-api/index.ts';
const input = { firstname: ' Ada ', lastname: 'Lovelace', email: ' ADA@EXAMPLE.COM ', street: 'Testweg', house_number: '1a', zip: '01234', city: 'Berlin', country: 'DE', quantity: 1000, expected_price_cents: 8500 };
test('validates address and normalizes email without a business quantity cap', () => {
  const actual = validateOrder(input);
  assert.equal(actual.email, 'ada@example.com'); assert.equal(actual.quantity, 1000); assert.equal(actual.zip, '01234');
  for (const patch of [{ quantity: 0 }, { quantity: 1.5 }, { country: 'AT' }, { zip: '123' }, { firstname: '\n' }]) assert.throws(() => validateOrder({ ...input, ...patch }));
  assert.equal(validateOrder({ ...input, country: 'CH', zip: '8000' }).zip, '8000');
});
test('transactional mail contains order snapshot but no marketing opt-in', () => {
  const mail = mailContent({ kind: 'order_received', payload: { ...input, id: 'order-id', quantity: 2, unit_price_cents: 8500, total_cents: 17000, campaign: '2026/27' } });
  assert.match(mail.text, /170,00/); assert.match(mail.text, /Lieferzusage/); assert.doesNotMatch(mail.text, /Newsletter|Bestätige deine Anmeldung/);
});
const config = { SITE_URL: 'https://akria.example', SUPABASE_URL: 'https://db.example', SUPABASE_SERVICE_ROLE_KEY: 'private', ORDER_RATE_LIMIT_SALT: 'salt', ORDER_WORKER_SECRET: 'a'.repeat(40), RESEND_API_KEY: 'secret', ORDER_FROM_EMAIL: 'AKRIA <order@example.com>' };
const env = name => config[name];
const json = (value, status = 200) => new Response(JSON.stringify(value), { status });
test('CORS denial and worker authorization happen before database calls', async () => {
  const handler = createHandler(env, () => { throw Error('must not call'); });
  assert.equal((await handler(new Request('https://edge.example/config', { headers: { origin: 'https://evil.example' } }))).status, 403);
  assert.equal((await handler(new Request('https://edge.example/worker', { method: 'POST' }))).status, 401);
});
test('order request needs no newsletter choice and creates no newsletter links', async () => {
  let args;
  const handler = createHandler(env, async (url, init) => {
    if (url.endsWith('checkout_rate_limit')) return json(true);
    assert.ok(url.endsWith('place_preorder')); args = JSON.parse(init.body);
    return json({ receipt: { id: 'order-id' } });
  });
  const result = await handler(new Request('https://edge.example/order', { method: 'POST', body: JSON.stringify({ ...input, request_id: crypto.randomUUID() }) }));
  assert.equal(result.status, 201); assert.deepEqual(await result.json(), { receipt: { id: 'order-id' } });
  assert.equal(args.p_confirmation_hash, null);
  assert.equal(args.p_unsubscribe_hash, null);
  assert.deepEqual(args.p_links, {});
  assert.equal(Object.hasOwn(args.p_input, 'newsletter'), false);
});
test('worker retains stable provider idempotency key and records provider failure for retry', async () => {
  let finished; let key;
  const handler = createHandler(env, async (url, init) => {
    if (url.endsWith('claim_order_mails')) return json([{ id: 'mail-id', lease_id: 'lease-id', kind: 'newsletter_confirm', payload: { email: 'ada@example.com', confirm_url: 'https://a', unsubscribe_url: 'https://b' } }]);
    if (url === 'https://api.resend.com/emails') { key = init.headers['Idempotency-Key']; return json({}, 429); }
    if (url.endsWith('finish_order_mail')) { finished = JSON.parse(init.body); return json(null); }
    throw Error(url);
  });
  const result = await handler(new Request('https://edge.example/worker', { method: 'POST', headers: { 'x-worker-secret': config.ORDER_WORKER_SECRET } }));
  assert.equal(result.status, 200); assert.equal(key, 'akria-mail-mail-id');
  assert.equal(finished.p_error, 'resend_http_429'); assert.equal(finished.p_lease, 'lease-id');
});
test('API refuses oversized streamed bodies and reports price conflict', async () => {
  const handler = createHandler(env, async url => url.endsWith('checkout_rate_limit') ? json(true) : json({ error: 'price_changed', unit_price_cents: 9500 }));
  assert.equal((await handler(new Request('https://edge.example/order', { method: 'POST', body: 'x'.repeat(17000) }))).status, 413);
  const response = await handler(new Request('https://edge.example/order', { method: 'POST', body: JSON.stringify({ ...input, request_id: crypto.randomUUID() }) }));
  assert.equal(response.status, 409); assert.equal((await response.json()).unit_price_cents, 9500);
});

test('order mail uses the public number in subject and body, with legacy payload fallback', () => {
  const payload = { ...input, id: 'legacy-order-id', order_number: 'AK-7K3M9P', quantity: 2, unit_price_cents: 8500, total_cents: 17000, campaign: '2026/27' };
  const mail = mailContent({ kind: 'order_received', payload });
  assert.equal(mail.subject, 'Deine AKRIA-Bestellung AK-7K3M9P ist eingegangen');
  assert.match(mail.text, /Bestellnummer: AK-7K3M9P/);
  assert.doesNotMatch(mail.text, /legacy-order-id/);
  const { order_number, ...legacy } = payload;
  const oldMail = mailContent({ kind: 'order_received', payload: legacy });
  assert.match(oldMail.subject, /legacy-order-id/);
  assert.match(oldMail.text, /Bestellnummer: legacy-order-id/);
});

test('legacy checkout retries preserve fingerprints but cannot subscribe', async () => {
  for (const newsletter of [true, false]) {
    const normalized = validateOrder(input);
    const { source, ...fields } = normalized;
    const fingerprint = await sha256(JSON.stringify({ ...fields, newsletter, source }));
    const handler = createHandler(env, async (url, init) => {
      if (url.endsWith('checkout_rate_limit')) return json(true);
      const args = JSON.parse(init.body);
      assert.equal(args.p_fingerprint, fingerprint);
      assert.equal(Object.hasOwn(args.p_input, 'newsletter'), false);
      assert.deepEqual(args.p_links, {});
      return json({ receipt: { id: 'existing-order' } });
    });
    const response = await handler(new Request('https://edge.example/order', {
      method: 'POST', body: JSON.stringify({ ...input, newsletter, request_id: crypto.randomUUID() }),
    }));
    assert.equal(response.status, 201);
  }
  assert.deepEqual(validateOrder({ ...input, newsletter: 'obsolete' }), validateOrder(input));
});
