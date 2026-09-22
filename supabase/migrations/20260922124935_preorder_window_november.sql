-- The final day of the 2026/27 preorder window is 15 November, local time.
-- Existing orders retain their recorded prices.
begin;

alter table public.preorder_settings
  alter column preorder_until set default '2026-11-16 00:00:00 Europe/Berlin';

update public.preorder_settings
set preorder_until = '2026-11-16 00:00:00 Europe/Berlin'
where id and campaign = '2026/27';

commit;
