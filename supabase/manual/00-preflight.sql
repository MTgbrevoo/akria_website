-- Nur lesen. Im SQL-Editor des Zielprojekts ausführen und Resultate prüfen.
select current_database() as database_name, current_user as database_user;
select 'sign_ups' as relation, count(*) as rows from public.sign_ups
union all select 'orders',count(*) from public.orders;
select count(*) as empty_emails from public.sign_ups where email is null or btrim(email)='';
-- Keine E-Mail-Adressen in diesem Diagnoseergebnis.
select count(*) as duplicate_email_groups from (
  select lower(btrim(email)) from public.sign_ups group by lower(btrim(email)) having count(*)>1
) d;
select table_name,column_name,data_type,is_nullable,column_default from information_schema.columns
where table_schema='public' and table_name in ('sign_ups','orders') order by table_name,ordinal_position;
select schemaname,tablename,policyname,roles,cmd from pg_policies where tablename in ('sign_ups','orders');
select event_object_schema,event_object_table,trigger_name,action_statement
from information_schema.triggers where event_object_table in ('users','sign_ups','orders');
select conname,conrelid::regclass as source,confrelid::regclass as target,pg_get_constraintdef(oid)
from pg_constraint where contype='f' and (confrelid in ('public.sign_ups'::regclass,'public.orders'::regclass)
  or conrelid in ('public.sign_ups'::regclass,'public.orders'::regclass));
