-- Removes newsletter side effects from checkout, including old clients.
-- Keep unused RPC arguments for compatibility during rollout; no tokens are consumed.
-- Existing subscriptions, links and queued mail remain valid.
begin;

create or replace function public.place_preorder(
  p_input jsonb, p_request_id uuid, p_fingerprint text,
  p_confirmation_hash text, p_unsubscribe_hash text, p_links jsonb
) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  o orders; c uuid; price integer; cfg preorder_settings;
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
  return jsonb_build_object('receipt',receipt);
end $$;

revoke all on function public.place_preorder(jsonb,uuid,text,text,text,jsonb) from public, anon, authenticated;
grant execute on function public.place_preorder(jsonb,uuid,text,text,text,jsonb) to service_role;

commit;
