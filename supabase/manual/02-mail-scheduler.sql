-- NACH 01-preorders.sql und Deployment der Edge Function ausführen.
-- Die zwei Platzhalter ersetzen. Das Worker-Secret muss identisch mit ORDER_WORKER_SECRET sein.
-- Vault speichert das Secret außerhalb des Cron-Job-Texts.
begin;
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
create extension if not exists supabase_vault with schema vault;
do $$
declare
  function_url text := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/orders-api/worker';
  worker_secret text := 'REPLACE_WITH_RANDOM_WORKER_SECRET_AT_LEAST_32_CHARACTERS';
  existing_id uuid;
begin
  if function_url like '%YOUR_PROJECT_REF%' or worker_secret like 'REPLACE_%' or length(worker_secret)<32 then
    raise exception 'Bitte Projekt-URL und Worker-Secret oben ersetzen.';
  end if;
  select id into existing_id from vault.secrets where name='akria_orders_worker_url';
  if existing_id is null then perform vault.create_secret(function_url,'akria_orders_worker_url');
  else perform vault.update_secret(existing_id,function_url); end if;
  select id into existing_id from vault.secrets where name='akria_orders_worker_secret';
  if existing_id is null then perform vault.create_secret(worker_secret,'akria_orders_worker_secret');
  else perform vault.update_secret(existing_id,worker_secret); end if;
end $$;
-- Nur fällige Aufträge, abgelaufene Leases oder notwendige Fehlerbereinigung starten den Worker.
select cron.schedule('akria-order-mail-worker','* * * * *',$job$
    do $worker$
    begin
      if exists (
        select 1 from public.mail_outbox
        where status in ('pending','sending') and (
          (status = 'pending' and available_at <= now())
          or (status = 'sending' and locked_at < now() - interval '5 minutes')
          or ((attempts >= 10 or first_attempt_at < now() - interval '23 hours')
              and (locked_at is null or locked_at < now() - interval '5 minutes'))
        )
      ) then
        perform net.http_post(
          url := (select decrypted_secret from vault.decrypted_secrets where name = 'akria_orders_worker_url'),
          headers := jsonb_build_object('Content-Type','application/json','x-worker-secret',
            (select decrypted_secret from vault.decrypted_secrets where name = 'akria_orders_worker_secret')),
          body := '{}'::jsonb,
          timeout_milliseconds := 60000
        );
      end if;
    end $worker$;
$job$);
select cron.schedule('akria-checkout-rate-cleanup','17 3 * * *',$job$
  delete from public.checkout_rate_limits where window_start < now() - interval '2 days';
$job$);
commit;
