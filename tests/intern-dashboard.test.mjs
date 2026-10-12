import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const migration = await readFile(new URL('../supabase/migrations/20261012100000_intern_dashboard.sql', import.meta.url), 'utf8');
const ADMIN = '11111111-1111-4111-8111-111111111111';
const CUSTOMER = '22222222-2222-4222-8222-222222222222';
const UNCONFIRMED = '33333333-3333-4333-8333-333333333333';
let db;

before(async () => {
  db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; grant usage on schema auth to anon, authenticated;
    create table auth.users(id uuid primary key, email text, email_confirmed_at timestamptz);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('test.uid', true), '')::uuid $$;
    grant usage on schema public to anon, authenticated;
    create table public.preorder_settings(id boolean primary key default true, campaign text, preorder_until timestamptz);
    insert into public.preorder_settings values (true, '2026/27', '2026-11-15 23:00+00');
    create table public.orders(id uuid primary key default gen_random_uuid(), campaign text, quantity int, total_amount numeric,
      country text, city text, created_at timestamptz default now());
    insert into public.orders(campaign, quantity, total_amount, country, city, created_at) values
      ('2026/27', 2, 170, 'DE', 'Weilheim', now() - interval '3 days'),
      ('2026/27', 1, 85, 'CH', ' Zürich ', now() - interval '1 day'),
      ('2026/27', 3, 255, 'DE', 'waldshut', now() - interval '10 days'),
      ('2026/27', 1, 85, 'DE', 'Waldshut-Tiengen', now()),
      ('2025/26', 5, 400, 'DE', 'Alt', now() - interval '200 days');
    insert into auth.users values
      ('${ADMIN}', 'Chef@Akria.de', now()),
      ('${CUSTOMER}', 'kunde@example.com', now()),
      ('${UNCONFIRMED}', 'partner@akria.de', null);`);
  await db.exec(migration);
  await db.exec(`insert into public.intern_access(email) values ('chef@akria.de'), ('partner@akria.de');`);
});
after(async () => { await db?.close(); });

async function dashboardAs(uid, role = 'authenticated') {
  await db.exec(`reset role; set test.uid = '${uid ?? ''}'; set role ${role};`);
  try { return (await db.query('select public.intern_dashboard() as value')).rows[0].value; }
  finally { await db.exec('reset role;'); }
}

test('freigegebene Person sieht Zahlen der aktuellen Kampagne', async () => {
  const d = await dashboardAs(ADMIN);
  assert.equal(d.campaign, '2026/27');
  assert.equal(d.orders, 4);
  assert.equal(d.units, 7);
  assert.equal(Number(d.revenue_eur), 595);
  assert.equal(d.units_7d, 4);
  assert.deepEqual(d.countries.map(c => [c.country, c.units]), [['DE', 6], ['CH', 1]]);
  assert.deepEqual(d.cities[0], { city: 'Waldshut-Tiengen', country: 'DE', orders: 2, units: 4 });
  assert.equal(d.daily.at(-1).units_cum, 7);
  assert.equal(d.daily.length, 11);
});

test('ohne Freigabe, unbestätigt oder abgemeldet gibt es keine Daten', async () => {
  await assert.rejects(dashboardAs(CUSTOMER), /not_authorized/);
  await assert.rejects(dashboardAs(UNCONFIRMED), /not_authorized/);
  await assert.rejects(dashboardAs(null, 'anon'), /permission denied/);
});

test('die Zugriffsliste ist für angemeldete Personen nicht lesbar', async () => {
  await db.exec('set role authenticated;');
  try { await assert.rejects(db.query('select * from public.intern_access'), /permission denied/); }
  finally { await db.exec('reset role;'); }
});
