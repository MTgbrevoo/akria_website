-- AKRIA V1: im SQL-Editor des RICHTIGEN Projekts als postgres ausführen.
-- Einmalige, transaktionale Migration. Bei Fehler wird alles zurückgerollt.
-- Alte sign_ups bleiben für die laufende Website kompatibel; keine Auth-Benutzer werden gelöscht.
begin;

-- Abbrechen statt bestehende Kontakte willkürlich zusammenzuführen.
do $$ begin
  if exists (select 1 from public.sign_ups where email is null or btrim(email) = '') then
    raise exception 'sign_ups enthält leere E-Mails. Vor Migration manuell bereinigen.';
  end if;
  if exists (select 1 from public.sign_ups group by lower(btrim(email)) having count(*) > 1) then
    raise exception 'sign_ups enthält doppelte normalisierte E-Mails. Vor Migration manuell zusammenführen.';
  end if;
end $$;

-- Geschützte Rückfallsicherung innerhalb derselben Datenbank, ohne Auth-Secrets.
create schema akria_preorders_backup_20260916;
revoke all on schema akria_preorders_backup_20260916 from public,anon,authenticated,service_role;
create table akria_preorders_backup_20260916.sign_ups as table public.sign_ups;
create table akria_preorders_backup_20260916.orders as table public.orders;
create table akria_preorders_backup_20260916.email_confirmation as
  select u.id,u.email_confirmed_at from auth.users u join public.sign_ups s on s.id=u.id;
revoke all on all tables in schema akria_preorders_backup_20260916 from public,anon,authenticated,service_role;

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(btrim(email)) and email <> ''),
  firstname text, lastname text, location text, street text, zip text, city text,
  country text, notes text, marketing_consent boolean,
  acquisition_source_code text, acquisition_source_type text,
  source_captured_at timestamptz, created_at timestamptz default now()
);
insert into public.contacts
select id, lower(btrim(email)), firstname, lastname, location, street, zip, city,
       country, notes, marketing_consent, acquisition_source_code, acquisition_source_type,
       source_captured_at, created_at from public.sign_ups;
comment on column public.contacts.marketing_consent is 'Historischer Wert. Aktueller Newsletterstatus steht in newsletter_subscriptions.';

create table public.preorder_settings (
  id boolean primary key default true check (id),
  campaign text not null default '2026/27',
  preorder_until timestamptz not null default '2026-12-16 00:00:00 Europe/Berlin',
  preorder_price_cents integer not null default 8500 check (preorder_price_cents > 0),
  regular_price_cents integer not null default 9500 check (regular_price_cents > 0),
  ordering_open boolean not null default true,
  legacy_links_until timestamptz not null default (now() + interval '30 days')
);
insert into public.preorder_settings (id) values (true);

-- Vorhandene Bestellungen bleiben erhalten; neue Felder nur für V1 verpflichtend.
alter table public.orders drop constraint orders_customer_id_fkey;
alter table public.orders add constraint orders_customer_id_fkey
  foreign key (customer_id) references public.contacts(id) on delete restrict;
alter table public.orders
  add column checkout_version integer,
  add column request_id uuid unique,
  add column request_fingerprint text,
  add column campaign text,
  add column firstname text, add column lastname text, add column email text,
  add column street text, add column house_number text, add column zip text,
  add column city text, add column country text,
  add column quantity integer,
  add column unit_price_cents integer,
  add column currency text,
  add column acquisition_source_code text;
alter table public.orders add constraint orders_v1_valid check (
  checkout_version is null or (
    checkout_version = 1 and customer_id is not null and request_id is not null
    and request_fingerprint is not null and campaign is not null
    and firstname is not null and lastname is not null and email is not null
    and street is not null and house_number is not null and zip is not null and city is not null
    and country is not null and country in ('DE','CH')
    and quantity is not null and quantity > 0
    and unit_price_cents is not null and unit_price_cents > 0
    and currency is not null and currency = 'EUR'
    and total_amount is not null and total_amount = quantity::numeric * unit_price_cents / 100
    and status is not null
  )
);
create index orders_customer_idx on public.orders(customer_id);

create table public.newsletter_subscriptions (
  contact_id uuid primary key references public.contacts(id) on delete restrict,
  status text not null check (status in ('pending','confirmed','unsubscribed')),
  consent_version text not null,
  requested_at timestamptz,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  confirmation_hash text unique,
  confirmation_expires_at timestamptz,
  unsubscribe_hash text unique
);
create table public.newsletter_events (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id) on delete restrict,
  event text not null,
  consent_version text not null,
  created_at timestamptz not null default now()
);
-- Der Live-Auth-Trigger legt sign_ups bereits VOR der E-Mail-Bestätigung an.
-- Daher Marketing-Flag UND tatsächlich bestätigte passende Auth-E-Mail prüfen.
insert into public.newsletter_subscriptions(contact_id,status,consent_version,requested_at,confirmed_at)
select s.id,
  case when u.email_confirmed_at is not null and lower(btrim(u.email))=lower(btrim(s.email)) then 'confirmed' else 'pending' end,
  'legacy-sign-ups',s.created_at,
  case when u.email_confirmed_at is not null and lower(btrim(u.email))=lower(btrim(s.email)) then u.email_confirmed_at else null end
from public.sign_ups s join auth.users u on u.id=s.id where s.marketing_consent is true;
insert into public.newsletter_events(contact_id,event,consent_version)
select contact_id,'legacy_import','legacy-sign-ups' from public.newsletter_subscriptions;

-- Bestehende Live-Website darf bis zum Frontend-Wechsel weiter Vormerkungen bestätigen.
-- Der vorhandene on_auth_user_created-Trigger bleibt unverändert.
create function public.sync_legacy_akria_confirmation() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare s sign_ups; c uuid;
begin
  if new.email_confirmed_at is null then return new; end if;
  select * into s from sign_ups where id=new.id;
  if not found or s.marketing_consent is not true or lower(btrim(new.email)) is distinct from lower(btrim(s.email)) then return new; end if;
  insert into contacts(id,email,firstname,lastname,acquisition_source_code)
  values(case when exists(select 1 from contacts where id=s.id) then gen_random_uuid() else s.id end,
    lower(btrim(s.email)),s.firstname,s.lastname,s.acquisition_source_code) on conflict(email) do nothing;
  select id into c from contacts where email=lower(btrim(s.email)) for update;
  insert into newsletter_subscriptions(contact_id,status,consent_version,requested_at,confirmed_at)
  values(c,'confirmed','legacy-sign-ups',s.created_at,new.email_confirmed_at)
  on conflict(contact_id) do update set status='confirmed',confirmed_at=excluded.confirmed_at
  where newsletter_subscriptions.status='pending' and newsletter_subscriptions.consent_version='legacy-sign-ups';
  if found then
    insert into newsletter_events(contact_id,event,consent_version) values(c,'legacy_confirmed','legacy-sign-ups');
  end if;
  return new;
end $$;
create trigger z_akria_legacy_confirmation after insert or update of email_confirmed_at on auth.users
for each row execute function public.sync_legacy_akria_confirmation();

create table public.mail_outbox (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete restrict,
  contact_id uuid not null references public.contacts(id) on delete restrict,
  kind text not null check (kind in ('order_received','newsletter_confirm')),
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending','sending','sent','failed')),
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  locked_at timestamptz,
  lease_id uuid,
  first_attempt_at timestamptz,
  sent_at timestamptz,
  provider_id text,
  last_error text,
  created_at timestamptz not null default now()
);
create index mail_outbox_due_idx on public.mail_outbox(available_at) where status in ('pending','sending');
create table public.checkout_rate_limits (
  key text primary key,
  window_start timestamptz not null,
  hits integer not null
);

-- Keine Browser-Rechte. Die Edge Function verwendet service_role ausschließlich serverseitig.
do $$ declare t text; begin
  foreach t in array array['contacts','orders','preorder_settings','newsletter_subscriptions','newsletter_events','mail_outbox','checkout_rate_limits'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from public, anon, authenticated', t);
    execute format('grant all on table public.%I to service_role', t);
  end loop;
end $$;

create function public.checkout_config() returns jsonb language sql stable security definer
set search_path = public, pg_temp as $$
  select jsonb_build_object('campaign',campaign,'preorder_until',preorder_until,
    'preorder_price_cents',preorder_price_cents,'regular_price_cents',regular_price_cents,
    'unit_price_cents',case when now() < preorder_until then preorder_price_cents else regular_price_cents end,
    'ordering_open',ordering_open,'currency','EUR') from preorder_settings where id;
$$;

create function public.checkout_rate_limit(p_key text, p_limit integer) returns boolean
language plpgsql security definer set search_path = public, pg_temp as $$
declare n integer;
begin
  insert into checkout_rate_limits as r values (p_key,now(),1)
  on conflict (key) do update set
    hits = case when r.window_start < now() - interval '1 hour' then 1 else r.hits + 1 end,
    window_start = case when r.window_start < now() - interval '1 hour' then now() else r.window_start end
  returning hits into n;
  return n <= p_limit;
end $$;

create function public.order_receipt(p_order public.orders) returns jsonb language sql immutable
set search_path = public, pg_temp as $$
  select jsonb_build_object('id',p_order.id,'created_at',p_order.created_at,
    'campaign',p_order.campaign,'firstname',p_order.firstname,'lastname',p_order.lastname,
    'email',p_order.email,'street',p_order.street,'house_number',p_order.house_number,
    'zip',p_order.zip,'city',p_order.city,'country',p_order.country,'quantity',p_order.quantity,
    'unit_price_cents',p_order.unit_price_cents,'total_cents',p_order.quantity::bigint * p_order.unit_price_cents,
    'currency',p_order.currency);
$$;

create function public.place_preorder(
  p_input jsonb, p_request_id uuid, p_fingerprint text,
  p_confirmation_hash text, p_unsubscribe_hash text, p_links jsonb
) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  o orders; c uuid; price integer; cfg preorder_settings; sub newsletter_subscriptions;
  receipt jsonb; field text; qty integer;
begin
  -- Serialize retries before looking up the result, including concurrent first submissions.
  perform pg_advisory_xact_lock(hashtextextended(p_request_id::text,0));
  select * into o from orders where request_id = p_request_id;
  if found then
    if o.request_fingerprint <> p_fingerprint then
      return jsonb_build_object('error','request_conflict');
    end if;
    return jsonb_build_object('receipt',order_receipt(o));
  end if;
  foreach field in array array['firstname','lastname','email','street','house_number','zip','city','country'] loop
    if nullif(btrim(p_input->>field),'') is null or length(p_input->>field) > 254 then
      return jsonb_build_object('error','invalid_input');
    end if;
  end loop;
  if p_input->>'country' not in ('DE','CH') or p_input->>'email' !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or coalesce(p_input->>'quantity','') !~ '^[1-9][0-9]*$' then
    return jsonb_build_object('error','invalid_input');
  end if;
  qty := (p_input->>'quantity')::integer;
  select * into strict cfg from preorder_settings where id;
  if not cfg.ordering_open then return jsonb_build_object('error','ordering_closed'); end if;
  price := case when now() < cfg.preorder_until then cfg.preorder_price_cents else cfg.regular_price_cents end;
  if (p_input->>'expected_price_cents')::integer is distinct from price then
    return jsonb_build_object('error','price_changed','unit_price_cents',price);
  end if;
  insert into contacts(email,firstname,lastname,street,zip,city,country,acquisition_source_code)
  values(lower(btrim(p_input->>'email')),p_input->>'firstname',p_input->>'lastname',
    p_input->>'street',p_input->>'zip',p_input->>'city',p_input->>'country',p_input->>'source')
  on conflict(email) do nothing;
  select id into strict c from contacts where email = lower(btrim(p_input->>'email'));
  -- Also serializes concurrent newsletter requests for this contact without changing contact data.
  perform 1 from contacts where id = c for update;
  insert into orders(checkout_version,request_id,request_fingerprint,customer_id,status,campaign,
    firstname,lastname,email,street,house_number,zip,city,country,quantity,unit_price_cents,currency,total_amount,acquisition_source_code)
  values(1,p_request_id,p_fingerprint,c,'received',cfg.campaign,
    p_input->>'firstname',p_input->>'lastname',p_input->>'email',p_input->>'street',p_input->>'house_number',
    p_input->>'zip',p_input->>'city',p_input->>'country',qty,price,'EUR',qty::numeric * price / 100,p_input->>'source')
  returning * into o;
  receipt := order_receipt(o);
  insert into mail_outbox(order_id,contact_id,kind,payload) values(o.id,c,'order_received',receipt);
  if p_input->>'newsletter' = 'true' then
    select * into sub from newsletter_subscriptions where contact_id = c;
    if not found or sub.status = 'unsubscribed' or (sub.status = 'pending' and sub.requested_at < now() - interval '1 day') then
      insert into newsletter_subscriptions(contact_id,status,consent_version,requested_at,confirmation_hash,confirmation_expires_at,unsubscribe_hash)
      values(c,'pending','akria-news-v1',now(),p_confirmation_hash,now() + interval '7 days',p_unsubscribe_hash)
      on conflict(contact_id) do update set status='pending',consent_version='akria-news-v1',requested_at=now(),
        confirmation_hash=excluded.confirmation_hash,confirmation_expires_at=excluded.confirmation_expires_at,
        unsubscribe_hash=excluded.unsubscribe_hash,confirmed_at=null;
      insert into newsletter_events(contact_id,event,consent_version) values(c,'requested','akria-news-v1');
      insert into mail_outbox(order_id,contact_id,kind,payload)
      values(o.id,c,'newsletter_confirm',jsonb_build_object('email',o.email,'confirm_url',p_links->>'confirm_url','unsubscribe_url',p_links->>'unsubscribe_url'));
    end if;
  end if;
  return jsonb_build_object('receipt',receipt);
end $$;

create function public.newsletter_action(p_hash text,p_action text) returns boolean
language plpgsql security definer set search_path = public, pg_temp as $$
declare s newsletter_subscriptions;
begin
  if p_action = 'confirm' then
    select * into s from newsletter_subscriptions where confirmation_hash=p_hash for update;
    if not found then return false; end if;
    if s.status='confirmed' then return true; end if;
    if s.status <> 'pending' or s.confirmation_expires_at <= now() then return false; end if;
    update newsletter_subscriptions set status='confirmed',confirmed_at=now(),unsubscribed_at=null where contact_id=s.contact_id;
  elsif p_action='unsubscribe' then
    select * into s from newsletter_subscriptions where unsubscribe_hash=p_hash for update;
    if not found then return false; end if;
    if s.status='unsubscribed' then return true; end if;
    update newsletter_subscriptions set status='unsubscribed',unsubscribed_at=now(),confirmation_hash=null where contact_id=s.contact_id;
  else return false;
  end if;
  insert into newsletter_events(contact_id,event,consent_version) values(s.contact_id,p_action,s.consent_version);
  return true;
end $$;

-- Bewahrt den Abschluss bereits versendeter alter Auth-Links für 30 Tage.
-- Edge Function prüft vorher Auth-Token und E-Mail-Bestätigung; UI verlangt expliziten Klick.
create function public.legacy_newsletter(p_email text,p_firstname text,p_lastname text) returns boolean
language plpgsql security definer set search_path = public, pg_temp as $$
declare c uuid; s newsletter_subscriptions;
begin
  if now() > (select legacy_links_until from preorder_settings where id) then return false; end if;
  insert into contacts(email,firstname,lastname) values(lower(btrim(p_email)),p_firstname,p_lastname) on conflict(email) do nothing;
  select id into c from contacts where email=lower(btrim(p_email)) for update;
  select * into s from newsletter_subscriptions where contact_id=c;
  if found and s.status='unsubscribed' then return false; end if;
  if found and s.status='confirmed' then return true; end if;
  insert into newsletter_subscriptions(contact_id,status,consent_version,requested_at,confirmed_at)
  values(c,'confirmed','legacy-link-explicit-v1',now(),now())
  on conflict(contact_id) do update set status='confirmed',confirmed_at=now(),consent_version='legacy-link-explicit-v1';
  insert into newsletter_events(contact_id,event,consent_version) values(c,'confirmed','legacy-link-explicit-v1');
  return true;
end $$;

create function public.claim_order_mails() returns setof public.mail_outbox
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  -- Resend dedupliziert 24h. Nach 23h keine unkontrollierte automatische Wiederholung.
  update mail_outbox set status='failed',last_error='Automatische Wiederholung beendet; Versandstatus beim Anbieter prüfen.'
  where status in ('pending','sending') and (attempts >= 10 or first_attempt_at < now() - interval '23 hours')
    and (locked_at is null or locked_at < now() - interval '5 minutes');
  return query with due as (
    select id from mail_outbox where
      (status='pending' and available_at <= now()) or (status='sending' and locked_at < now() - interval '5 minutes')
    order by created_at for update skip locked limit 10
  ) update mail_outbox m set status='sending',locked_at=now(),lease_id=gen_random_uuid(),
      first_attempt_at=coalesce(first_attempt_at,now()),attempts=m.attempts+1
    from due where m.id=due.id returning m.*;
end $$;

create function public.finish_order_mail(p_id uuid,p_lease uuid,p_provider_id text,p_error text) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  update mail_outbox set
    status=case when p_error is null then 'sent' when attempts>=10 then 'failed' else 'pending' end,
    sent_at=case when p_error is null then now() else null end,
    provider_id=p_provider_id,last_error=left(p_error,500),locked_at=null,
    available_at=now() + make_interval(secs => least(3600,30 * power(2,attempts)::integer))
  where id=p_id and lease_id=p_lease and status='sending';
end $$;

-- Funktionen niemals direkt aus dem Browser ausführbar machen.
do $$ declare f record; begin
  for f in select oid::regprocedure as signature from pg_proc where pronamespace='public'::regnamespace
    and proname in ('sync_legacy_akria_confirmation','checkout_config','checkout_rate_limit','order_receipt','place_preorder','newsletter_action','legacy_newsletter','claim_order_mails','finish_order_mail') loop
    execute format('revoke all on function %s from public, anon, authenticated',f.signature);
    execute format('grant execute on function %s to service_role',f.signature);
  end loop;
end $$;
commit;
