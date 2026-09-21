-- LESEN: Mailwarteschlange / Probleme. Im Table Editor ist mail_outbox ebenfalls sichtbar.
select status,count(*),min(created_at) as oldest from public.mail_outbox group by status;
select id,order_id,kind,status,attempts,last_error,created_at,provider_id
from public.mail_outbox where status='failed' or (status in ('pending','sending') and created_at < now()-interval '10 minutes')
order by created_at;

-- LESEN: operative Bestellliste, einschließlich Kontaktzuordnung.
-- Nach Anwendung der Migration short_order_numbers:
select order_number as bestellnummer,id as bestell_id,customer_id as kontakt_id,firstname,lastname,email,quantity as stueck,
  unit_price_cents/100.0 as stueckpreis_eur,total_amount as warenbetrag_eur,
  street,house_number,zip,city,country,status,created_at
from public.orders where checkout_version=1 order by created_at desc;

-- ÄNDERUNGEN: Nur die benötigte Anweisung separat markieren und ausführen.
-- Stichtag: exklusives Ende, d.h. am 16.12. ab 00:00 gilt der reguläre Preis.
-- update public.preorder_settings set preorder_until='2026-12-16 00:00:00 Europe/Berlin' where id;
-- Neue Bestellungen vorübergehend stoppen (Wiederholungen gespeicherter Vorgänge bleiben abrufbar):
-- update public.preorder_settings set ordering_open=false where id;
-- Wieder öffnen:
-- update public.preorder_settings set ordering_open=true where id;

-- Newsletter manuell nach Anfrage abmelden (Adresse einsetzen):
-- begin;
-- update public.newsletter_subscriptions set status='unsubscribed',unsubscribed_at=now(),confirmation_hash=null
-- where contact_id=(select id from public.contacts where email=lower(btrim('KUNDENADRESSE')));
-- insert into public.newsletter_events(contact_id,event,consent_version)
-- select contact_id,'manual_unsubscribe',consent_version from public.newsletter_subscriptions
-- where contact_id=(select id from public.contacts where email=lower(btrim('KUNDENADRESSE')));
-- commit;
