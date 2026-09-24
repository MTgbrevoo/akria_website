-- Keep the existing job identity, cadence and active state; only replace its command.
-- Gate all work done by claim_order_mails, including expired attempts awaiting failure cleanup.
do $migration$
declare worker_job_id bigint;
begin
  select jobid into strict worker_job_id from cron.job where jobname = 'akria-order-mail-worker';
  perform cron.alter_job(worker_job_id, command := $job$
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
end $migration$;
