import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
const legacy = '11111111-1111-4111-8111-111111111111';
let db;
const migration = await readFile(new URL('../supabase/manual/01-preorders.sql', import.meta.url), 'utf8');
const shortNumbers = await readFile(new URL('../supabase/migrations/20260921154632_short_order_numbers.sql', import.meta.url), 'utf8');
const removeNewsletter = await readFile(new URL('../supabase/migrations/20260922121348_remove_checkout_newsletter.sql', import.meta.url), 'utf8');
const novemberWindow = await readFile(new URL('../supabase/migrations/20260922124935_preorder_window_november.sql', import.meta.url), 'utf8');
async function setup() {
  const instance = new PGlite();
  await instance.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);
    create table public.sign_ups(id uuid primary key references auth.users(id) on delete cascade,
      firstname text,lastname text,email text,location text,street text,zip text,city text,country text,notes text,
      marketing_consent boolean,acquisition_source_code text,acquisition_source_type text,source_captured_at timestamptz,created_at timestamptz default now());
    create table public.orders(id uuid primary key default gen_random_uuid(),customer_id uuid references sign_ups(id) on delete cascade,status text,total_amount numeric,created_at timestamptz default now());
    insert into auth.users values('${legacy}','old@example.com','2026-09-01T12:00:00Z');
    insert into auth.users values('33333333-3333-4333-8333-333333333333','pending@example.com',null);
    insert into sign_ups(id,email,marketing_consent) values('33333333-3333-4333-8333-333333333333','pending@example.com',true);
    insert into sign_ups(id,email,firstname,marketing_consent) values('${legacy}',' Old@Example.com ','Original',true);
    insert into orders(customer_id,status,total_amount) values('${legacy}','old',85);`);
  return instance;
}
before(async () => { db = await setup(); await db.exec(migration); await db.exec(shortNumbers); await db.exec(removeNewsletter); await db.exec(novemberWindow); });
after(async () => { await db?.close(); });
const input = (extra = {}) => ({ firstname: 'Ada', lastname: 'Lovelace', email: 'ada@example.com', street: 'Testweg', house_number: '2', zip: '01234', city: 'Berlin', country: 'DE', quantity: 2, expected_price_cents: 8500, source: 'website', ...extra });
async function place(data = input(), id = crypto.randomUUID(), fingerprint = JSON.stringify(data)) {
  const result = await db.query('select place_preorder($1,$2,$3,$4,$5,$6) as value', [data, id, fingerprint, crypto.randomUUID(), crypto.randomUUID(), { confirm_url: 'https://example/confirm', unsubscribe_url: 'https://example/unsubscribe' }]);
  return result.rows[0].value;
}
async function scalar(sql, params = []) { return (await db.query(sql, params)).rows[0].value; }

test('migration preserves legacy ids/orders/consent without inventing DOI timestamps', async () => {
  assert.equal(await scalar('select email as value from contacts where id=$1',[legacy]), 'old@example.com');
  assert.equal(await scalar('select count(*)::int as value from orders where customer_id=$1',[legacy]), 1);
  assert.ok(await scalar('select confirmed_at as value from newsletter_subscriptions where contact_id=$1',[legacy]));
  assert.equal(await scalar("select status as value from newsletter_subscriptions where contact_id='33333333-3333-4333-8333-333333333333'"), 'pending');
  assert.equal(await scalar('select status as value from newsletter_subscriptions where contact_id=$1',[legacy]), 'confirmed');
});
test('preorder window ends after 15 November in German and Swiss local time', async () => {
  const config = await scalar('select checkout_config() as value');
  assert.equal(new Date(config.preorder_until).toISOString(), '2026-11-15T23:00:00.000Z');
  assert.equal(await scalar("select to_char(preorder_until at time zone 'Europe/Berlin', 'YYYY-MM-DD HH24:MI:SS') as value from preorder_settings"), '2026-11-16 00:00:00');
  assert.equal(await scalar("select to_char(preorder_until at time zone 'Europe/Zurich', 'YYYY-MM-DD HH24:MI:SS') as value from preorder_settings"), '2026-11-16 00:00:00');
});
test('atomic order, snapshot, outbox and retry independent of later price switch', async () => {
  await db.exec("update preorder_settings set preorder_until=now()+interval '1 day'");
  const id = crypto.randomUUID(); const data = input();
  const first = await place(data,id);
  assert.equal(first.receipt.total_cents,17000);
  assert.match(first.receipt.order_number, /^AK-[2-9A-HJ-NP-Z]{6}$/);
  assert.equal(await scalar('select order_number as value from orders where id=$1',[first.receipt.id]), first.receipt.order_number);
  assert.equal(await scalar("select payload->>'order_number' as value from mail_outbox where order_id=$1",[first.receipt.id]), first.receipt.order_number);
  assert.equal(await scalar('select count(*)::int as value from mail_outbox where order_id=$1',[first.receipt.id]), 1);
  await db.exec("update preorder_settings set preorder_until=now()-interval '1 second'");
  assert.deepEqual(await place(data,id), first);
  assert.equal((await place(input({quantity:3}),id)).error, 'request_conflict');
  assert.equal((await place()).error, 'price_changed');
  const next = await place(input({quantity:3,expected_price_cents:9500,firstname:'Changed'}));
  assert.equal(next.receipt.total_cents,28500);
  assert.equal(await scalar("select firstname as value from contacts where email='ada@example.com'"), 'Ada');
  assert.equal(await scalar("select count(*)::int as value from contacts where email='ada@example.com'"), 1);
  await db.exec("update preorder_settings set preorder_until=now()+interval '1 day'");
});
test('checkout never creates newsletter subscriptions, events or confirmation mail', async () => {
  const before = await db.query('select * from newsletter_subscriptions order by contact_id');
  const events = await scalar('select count(*)::int as value from newsletter_events');
  for (const extra of [{}, { newsletter: true }, { newsletter: false }, { email: 'old@example.com', newsletter: true }]) {
    const result = await place(input({ email: 'no-newsletter@example.com', ...extra }));
    assert.ok(result.receipt.id);
    const mails = (await db.query('select kind from mail_outbox where order_id=$1', [result.receipt.id])).rows;
    assert.deepEqual(mails, [{ kind: 'order_received' }]);
  }
  assert.deepEqual((await db.query('select * from newsletter_subscriptions order by contact_id')).rows, before.rows);
  assert.equal(await scalar('select count(*)::int as value from newsletter_events'), events);
});
test('cleanup preserves existing newsletter links, queued mail and order retries', async () => {
  const isolated = await setup();
  try {
    await isolated.exec(migration);
    await isolated.exec(shortNumbers);
    await isolated.exec("update preorder_settings set preorder_until=now()+interval '1 day'");
    const args = [input({ newsletter: true }), crypto.randomUUID(), 'old-fingerprint', 'confirm-token', 'unsubscribe-token', {}];
    const query = 'select place_preorder($1,$2,$3,$4,$5,$6) as value';
    const original = (await isolated.query(query, args)).rows[0].value;
    const mails = (await isolated.query('select * from mail_outbox order by id')).rows;
    await isolated.exec(removeNewsletter);
    assert.deepEqual((await isolated.query(query, args)).rows[0].value, original);
    assert.deepEqual((await isolated.query('select * from mail_outbox order by id')).rows, mails);
    for (const action of ['confirm', 'confirm', 'unsubscribe']) {
      const token = action === 'confirm' ? 'confirm-token' : 'unsubscribe-token';
      assert.equal((await isolated.query('select newsletter_action($1,$2) as value', [token, action])).rows[0].value, true);
    }
    assert.equal((await isolated.query("select newsletter_action('confirm-token','confirm') as value")).rows[0].value, false);
  } finally { await isolated.close(); }
});
test('mail leases prevent stale acknowledgement; provider failure keeps order and retries', async () => {
  const mails = (await db.query('select * from claim_order_mails()')).rows;
  assert.ok(mails.length);
  const mail=mails[0];
  await db.query('select finish_order_mail($1,$2,null,$3)',[mail.id,crypto.randomUUID(),'stale']);
  assert.equal(await scalar('select status as value from mail_outbox where id=$1',[mail.id]),'sending');
  await db.query('select finish_order_mail($1,$2,null,$3)',[mail.id,mail.lease_id,'resend_http_429']);
  assert.equal(await scalar('select status as value from mail_outbox where id=$1',[mail.id]),'pending');
  assert.equal(await scalar('select count(*)::int as value from orders where id=$1',[mail.order_id]),1);
  await db.query("update mail_outbox set first_attempt_at=now()-interval '24 hours',available_at=now() where id=$1",[mail.id]);
  await db.query('select * from claim_order_mails()');
  assert.equal(await scalar('select status as value from mail_outbox where id=$1',[mail.id]),'failed');
});
test('DB validation, closed checkout, no cascading deletion, and role privileges', async () => {
  assert.equal((await place(input({quantity:0}))).error,'invalid_input');
  assert.ok((await place(input({quantity:1000}))).receipt);
  await db.exec('update preorder_settings set ordering_open=false');
  assert.equal((await place()).error,'ordering_closed');
  await db.exec('update preorder_settings set ordering_open=true');
  await assert.rejects(db.query('delete from contacts where id=$1',[legacy]),/foreign key/);
  assert.equal(await scalar("select has_table_privilege('anon','contacts','SELECT') as value"),false);
  assert.equal(await scalar("select has_table_privilege('authenticated','orders','INSERT') as value"),false);
  assert.equal(await scalar("select has_function_privilege('anon','place_preorder(jsonb,uuid,text,text,text,jsonb)','EXECUTE') as value"),false);
});
test('duplicate-email preflight rolls back rather than merging or losing rows', async () => {
  const isolated = await setup();
  try {
    await isolated.exec("insert into auth.users(id) values('22222222-2222-4222-8222-222222222222'); insert into sign_ups(id,email) values('22222222-2222-4222-8222-222222222222','old@example.com');");
    await assert.rejects(isolated.exec(migration), /doppelte normalisierte E-Mails/);
    await isolated.exec('rollback');
    assert.equal((await isolated.query('select count(*)::int as count from sign_ups')).rows[0].count,3);
    assert.equal((await isolated.query("select to_regclass('public.contacts') as value")).rows[0].value,null);
  } finally { await isolated.close(); }
});

test('legacy confirmation transition syncs pending consent but never reactivates unsubscribed contacts', async () => {
  await db.exec("update auth.users set email_confirmed_at=now() where id='33333333-3333-4333-8333-333333333333'");
  assert.equal(await scalar("select status as value from newsletter_subscriptions where contact_id='33333333-3333-4333-8333-333333333333'"),'confirmed');
  await db.exec("update newsletter_subscriptions set status='unsubscribed' where contact_id='33333333-3333-4333-8333-333333333333'; update auth.users set email_confirmed_at=now() where id='33333333-3333-4333-8333-333333333333'");
  assert.equal(await scalar("select status as value from newsletter_subscriptions where contact_id='33333333-3333-4333-8333-333333333333'"),'unsubscribed');
});


test('random number collisions retry without duplicate orders or mail', async () => {
  const existing = (await place()).receipt;
  await db.exec('begin');
  try {
    await db.exec(`create sequence public.test_number_attempts;
      create or replace function public.random_order_number() returns text
      language plpgsql volatile set search_path=pg_catalog as $$
      begin
        if nextval('public.test_number_attempts') = 1 then return '${existing.order_number}'; end if;
        return 'AK-ZZZZZZ';
      end $$;`);
    const result = await place(input({email:'collision@example.com'}));
    assert.equal(result.receipt.order_number, 'AK-ZZZZZZ');
    assert.equal(await scalar('select last_value::int as value from test_number_attempts'), 2);
    assert.equal(await scalar('select count(*)::int as value from orders where id=$1',[result.receipt.id]), 1);
    assert.equal(await scalar('select count(*)::int as value from mail_outbox where order_id=$1',[result.receipt.id]), 1);
    await assert.rejects(db.query('update orders set order_number=$1 where id=$2',[existing.order_number,result.receipt.id]), /orders_order_number_key/);
  } finally { await db.exec('rollback'); }
});

test('number migration preserves existing order IDs and queued mail payloads', async () => {
  const isolated = await setup();
  try {
    await isolated.exec(migration);
    await isolated.exec("update preorder_settings set preorder_until=now()+interval '1 day'");
    const args = [input(),crypto.randomUUID(),'before-migration','confirm','unsubscribe',{}];
    const query = 'select place_preorder($1,$2,$3,$4,$5,$6) as value';
    const original = (await isolated.query(query,args)).rows[0].value.receipt;
    const oldMail = (await isolated.query('select payload from mail_outbox where order_id=$1',[original.id])).rows[0].payload;
    await isolated.exec(shortNumbers);
    const current = (await isolated.query(query,args)).rows[0].value.receipt;
    assert.equal(current.id, original.id);
    assert.match(current.order_number, /^AK-[2-9A-HJ-NP-Z]{6}$/);
    const { order_number, ...unchanged } = current;
    assert.deepEqual(unchanged, original);
    assert.deepEqual((await isolated.query('select payload from mail_outbox where order_id=$1',[original.id])).rows[0].payload, oldMail);
    assert.equal((await isolated.query('select count(*)::int as count from orders where order_number is null')).rows[0].count, 0);
    for (const role of ['anon','authenticated']) {
      assert.equal((await isolated.query(`select has_function_privilege('${role}','random_order_number()','EXECUTE') as allowed`)).rows[0].allowed,false);
      assert.equal((await isolated.query(`select has_function_privilege('${role}','place_preorder(jsonb,uuid,text,text,text,jsonb)','EXECUTE') as allowed`)).rows[0].allowed,false);
    }
  } finally { await isolated.close(); }
});
