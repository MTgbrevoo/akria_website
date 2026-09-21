-- Prerequisite: supabase/manual/01-preorders.sql has already been applied.
-- Deploy the compatible orders-api mail renderer BEFORE applying this migration.
-- Existing mail payloads are intentionally preserved, including retries already sent to Resend.
begin;

create function public.random_order_number() returns text
language plpgsql volatile security invoker set search_path = pg_catalog as $$
declare
  alphabet constant text := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  entropy bytea := uuid_send(gen_random_uuid());
  result text := 'AK-';
begin
  -- The first six UUID v4 bytes are random (no version/variant bits).
  for i in 0..5 loop
    result := result || substr(alphabet, (get_byte(entropy, i) % 32) + 1, 1);
  end loop;
  return result;
end $$;
revoke all on function public.random_order_number() from public, anon, authenticated;
grant execute on function public.random_order_number() to service_role;

alter table public.orders add column order_number text;
alter table public.orders add constraint orders_order_number_key unique(order_number);
alter table public.orders add constraint orders_order_number_format
  check (order_number ~ '^AK-[2-9A-HJ-NP-Z]{6}$');
alter table public.orders alter column order_number set default public.random_order_number();

-- Backfill without replacing UUIDs, foreign keys, or previously mailed references.
do $$
declare existing record; collision_constraint text;
begin
  for existing in select id from public.orders where order_number is null loop
    for attempt in 1..20 loop
      begin
        update public.orders set order_number = public.random_order_number() where id = existing.id;
        exit;
      exception when unique_violation then
        get stacked diagnostics collision_constraint = constraint_name;
        if collision_constraint <> 'orders_order_number_key' or attempt = 20 then raise; end if;
      end;
    end loop;
  end loop;
end $$;
alter table public.orders alter column order_number set not null;

create or replace function public.order_receipt(p_order public.orders) returns jsonb language sql immutable
set search_path = public, pg_temp as $$
  select jsonb_build_object('id',p_order.id,'order_number',p_order.order_number,'created_at',p_order.created_at,
    'campaign',p_order.campaign,'firstname',p_order.firstname,'lastname',p_order.lastname,
    'email',p_order.email,'street',p_order.street,'house_number',p_order.house_number,
    'zip',p_order.zip,'city',p_order.city,'country',p_order.country,'quantity',p_order.quantity,
    'unit_price_cents',p_order.unit_price_cents,'total_cents',p_order.quantity::bigint * p_order.unit_price_cents,
    'currency',p_order.currency);
$$;

create or replace function public.place_preorder(
  p_input jsonb, p_request_id uuid, p_fingerprint text,
  p_confirmation_hash text, p_unsubscribe_hash text, p_links jsonb
) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  o orders; c uuid; price integer; cfg preorder_settings; sub newsletter_subscriptions;
  receipt jsonb; field text; qty integer; collision_constraint text;
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
  -- Retry only a random public-number collision; all other errors still surface.
  for attempt in 1..20 loop
    begin
      insert into orders(checkout_version,request_id,request_fingerprint,customer_id,status,campaign,
        firstname,lastname,email,street,house_number,zip,city,country,quantity,unit_price_cents,currency,total_amount,acquisition_source_code)
      values(1,p_request_id,p_fingerprint,c,'received',cfg.campaign,
        p_input->>'firstname',p_input->>'lastname',p_input->>'email',p_input->>'street',p_input->>'house_number',
        p_input->>'zip',p_input->>'city',p_input->>'country',qty,price,'EUR',qty::numeric * price / 100,p_input->>'source')
      returning * into o;
      exit;
    exception when unique_violation then
      get stacked diagnostics collision_constraint = constraint_name;
      if collision_constraint <> 'orders_order_number_key' or attempt = 20 then raise; end if;
    end;
  end loop;
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

-- CREATE OR REPLACE keeps existing RPC grants; assert the intended service-only boundary.
revoke all on function public.order_receipt(public.orders) from public, anon, authenticated;
revoke all on function public.place_preorder(jsonb,uuid,text,text,text,jsonb) from public, anon, authenticated;
grant execute on function public.order_receipt(public.orders) to service_role;
grant execute on function public.place_preorder(jsonb,uuid,text,text,text,jsonb) to service_role;

commit;
