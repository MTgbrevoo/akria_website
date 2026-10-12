-- Interne Bestellübersicht (/intern).
-- Nur angemeldete Personen, deren bestätigte E-Mail in public.intern_access steht,
-- erhalten zusammengefasste Zahlen. Keine Namen, E-Mails oder Adressen.

create table if not exists public.intern_access (
  email text primary key check (email = lower(btrim(email)) and email <> ''),
  created_at timestamptz not null default now()
);

alter table public.intern_access enable row level security;
revoke all on table public.intern_access from public, anon, authenticated;
grant all on table public.intern_access to service_role;

create or replace function public.intern_dashboard()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $fn$
declare
  v_email text;
  v_result jsonb;
begin
  select lower(btrim(u.email)) into v_email
  from auth.users u
  where u.id = auth.uid() and u.email_confirmed_at is not null;

  if v_email is null or not exists (select 1 from public.intern_access a where a.email = v_email) then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  with s as (
    select campaign, preorder_until from public.preorder_settings limit 1
  ), o as (
    select o.created_at, o.quantity, o.total_amount, o.country, o.city
    from public.orders o join s on o.campaign = s.campaign
  ), d as (
    select (created_at at time zone 'Europe/Zurich')::date as day, count(*) as n, sum(quantity) as q
    from o group by 1
  ), r as (
    select g::date as day
    from generate_series((select min(day) from d), (now() at time zone 'Europe/Zurich')::date, interval '1 day') g
  ), daily as (
    select r.day, coalesce(d.n, 0)::int as orders, coalesce(d.q, 0)::int as units,
           (sum(coalesce(d.q, 0)) over (order by r.day))::int as units_cum
    from r left join d on d.day = r.day
  ), countries as (
    select coalesce(country, '?') as country, count(*)::int as orders, coalesce(sum(quantity), 0)::int as units
    from o group by 1
  ), cities as (
    select coalesce(min(city), 'Unbekannt') as city, coalesce(country, '?') as country,
           count(*)::int as orders, coalesce(sum(quantity), 0)::int as units
    from (
      select case when lower(btrim(city)) like 'waldshut%' then 'Waldshut-Tiengen' else btrim(city) end as city,
             country, quantity
      from o
    ) x
    group by lower(city), country
  )
  select jsonb_build_object(
    'generated_at', now(),
    'campaign', (select campaign from s),
    'preorder_until', (select preorder_until from s),
    'orders', (select count(*)::int from o),
    'units', (select coalesce(sum(quantity), 0)::int from o),
    'revenue_eur', (select coalesce(sum(total_amount), 0) from o),
    'orders_7d', (select count(*)::int from o where created_at >= now() - interval '7 days'),
    'units_7d', (select coalesce(sum(quantity), 0)::int from o where created_at >= now() - interval '7 days'),
    'last_order_at', (select max(created_at) from o),
    'daily', coalesce((select jsonb_agg(jsonb_build_object('day', day, 'orders', orders, 'units', units, 'units_cum', units_cum) order by day) from daily), '[]'::jsonb),
    'countries', coalesce((select jsonb_agg(jsonb_build_object('country', country, 'orders', orders, 'units', units) order by units desc, orders desc) from countries), '[]'::jsonb),
    'cities', coalesce((select jsonb_agg(jsonb_build_object('city', city, 'country', country, 'orders', orders, 'units', units) order by units desc, orders desc, city) from cities), '[]'::jsonb)
  ) into v_result;

  return v_result;
end
$fn$;

revoke all on function public.intern_dashboard() from public, anon;
grant execute on function public.intern_dashboard() to authenticated, service_role;
