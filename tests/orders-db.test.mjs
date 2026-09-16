import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
const legacy = '11111111-1111-4111-8111-111111111111';
let db;
const migration = await readFile(new URL('../supabase/manual/01-preorders.sql', import.meta.url), 'utf8');
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
before(async () => { db = await setup(); await db.exec(migration); });
after(async () => { await db?.close(); });
const input = (extra = {}) => ({ firstname: 'Ada', lastname: 'Lovelace', email: 'ada@example.com', street: 'Testweg', house_number: '2', zip: '01234', city: 'Berlin', country: 'DE', quantity: 2, expected_price_cents: 8500, newsletter: false, source: 'website', ...extra });
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
test('atomic order, snapshot, outbox and retry independent of later price switch', async () => {
  await db.exec("update preorder_settings set preorder_until=now()+interval '1 day'");
  const id = crypto.randomUUID(); const data = input();
  const first = await place(data,id);
  assert.equal(first.receipt.total_cents,17000);
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
test('pending newsletter is separate, confirm idempotent, unsubscribe invalidates confirmation', async () => {
  const data = input({email:'newsletter@example.com',newsletter:true});
  const result = (await db.query('select place_preorder($1,$2,$3,$4,$5,$6) as value',[data,crypto.randomUUID(),'newsletter','confirm-token','unsubscribe-token',{}])).rows[0].value;
  const c = await scalar('select customer_id as value from orders where id=$1',[result.receipt.id]);
  assert.equal(await scalar('select status as value from newsletter_subscriptions where contact_id=$1',[c]),'pending');
  assert.equal(await scalar("select newsletter_action('confirm-token','confirm') as value"),true);
  assert.equal(await scalar("select newsletter_action('confirm-token','confirm') as value"),true);
  await place(input({email:'newsletter@example.com',newsletter:false}));
  assert.equal(await scalar('select status as value from newsletter_subscriptions where contact_id=$1',[c]),'confirmed');
  assert.equal(await scalar("select newsletter_action('unsubscribe-token','unsubscribe') as value"),true);
  assert.equal(await scalar("select newsletter_action('confirm-token','confirm') as value"),false);
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
