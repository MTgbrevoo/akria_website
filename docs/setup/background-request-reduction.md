# Hintergrundanfragen reduzieren

Die Startseite lädt die Preiskonfiguration bei Sichtbarkeit höchstens alle fünf Minuten. Fensterfokus und Sichtbarkeitswechsel teilen dieselbe laufende Anfrage und Mindestwartezeit; das gilt auch nach Fehlern und bei internen Routenwechseln. Versteckte Tabs lösen keine neuen Abfragen aus. Bereits laufende Requests dürfen noch abschließen. Das Bestellformular lädt weiterhin einen frischen Preis, und `place_preorder` prüft ihn beim Absenden erneut.

Der Mail-Cron-Job bleibt minütlich. Er startet die Edge Function nur, wenn `claim_order_mails` etwas bearbeiten kann: fällige `pending`-Aufträge, `sending`-Aufträge mit einer älter als fünf Minuten gewordenen Lease oder Aufträge, die wegen zehn Versuchen bzw. Ablauf des 23-Stunden-Fensters als fehlgeschlagen markiert werden müssen. Aktive Leases werden bei der Fehlerbereinigung respektiert. Vorhandene Cron-Protokollschreibvorgänge bleiben bestehen; reduziert werden die leeren HTTP-Aufrufe und Worker-Datenbankaufrufe.

## Rollout

- Migration: `supabase/migrations/20260924160332_gate_order_mail_worker.sql`.
- Voraussetzung: vorhandener Cron-Job `akria-order-mail-worker` aus `02-mail-scheduler.sql`. Fehlt er, bricht die Migration ab.
- Die Migration ersetzt nur den Job-Befehl. Job-ID, Zeitplan, Aktivierungsstatus, Vault-Einträge, Outbox, RLS und Funktionen bleiben erhalten.
- Live angewendet auf AKRIA (`khizcgryvscakouefofc`) am 24.09.2026 um 16:03:32 UTC / 18:03:32 Europe/Zurich.
- Unmittelbare Verifikation: Job 1 aktiv, weiterhin minütlich, neuer Filter vorhanden; acht Outbox-Einträge weiterhin `sent`.
- Frontend wird über `MTgbrevoo/akria_website`, Branch `main`, im bestehenden Vercel-Projekt `akria-website` veröffentlicht.
- Bereits geöffnete alte Website-Tabs benötigen ein Neuladen, damit dort die neue Abfragelogik läuft.

## Verifikation

- `npm test`: 22 API-/Datenbanktests erfolgreich, einschließlich elf Scheduler-Szenarien und leerer Outbox. HTTP und Vault sind im lokalen Datenbanktest simuliert; keine Testmails werden gesendet.
- `npm run typecheck` und `npm run build`: erfolgreich.
- Browser: `npx playwright test tests/browser/orders.spec.ts tests/browser/price-refresh.spec.ts --workers=2` – 14 Tests erfolgreich. Externe Requests sind abgefangen.
- Bei leerer Outbox nach mindestens zwei regulären Cron-Ticks: neue erfolgreiche Cron-Läufe, aber keine zusätzlichen Worker-HTTP-Aufrufe erwarten. Keine Testaufträge in Produktion anlegen.

```sql
select jobid, jobname, schedule, active
from cron.job where jobname = 'akria-order-mail-worker';

select status, count(*)
from cron.job_run_details
where jobid = (select jobid from cron.job where jobname = 'akria-order-mail-worker')
  and start_time >= timestamptz '2026-09-24 16:04:00+00'
group by status;

select count(*) as http_responses_since_change
from net._http_response
where created >= timestamptz '2026-09-24 16:04:00+00';

select status, count(*) from public.mail_outbox group by status;
```

HTTP-Antworten unter `net` werden nur begrenzt aufbewahrt; die Abfrage ist für den unmittelbaren Rollout gedacht. Bei echten neuen Bestellungen sind HTTP-Aufrufe erwünscht.

## Ressourcenvergleich

Das Dashboard bestätigte vor dem Rollout `NANO` / `t4g.nano` im Free-Plan. Die Memory-Grafik über die letzten 24 Stunden zeigte belegten Swap-Speicher; das allein beweist keine aktive Swap-I/O-Rate. IOPS- und Disk-Throughput-Diagramme meldeten beim Abruf `Unable to load data`.

Für eine belastbare Wirkungsmessung denselben Zeitraum vor/nach der Änderung vergleichen, möglichst über einen vollständigen Tageszyklus. Weniger Requests sind unmittelbar messbar, eine behobene Disk-I/O-Erschöpfung darf daraus noch nicht abgeleitet werden. [Dashboard](https://supabase.com/dashboard/project/khizcgryvscakouefofc/observability/database), [Supabase Disk-I/O-Erklärung](https://supabase.com/docs/guides/troubleshooting/exhaust-disk-io).

Der Performance-Advisor meldet Hinweise an unveränderten Bestandsobjekten: [Foreign-Key-Indizes](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys), [Auth-RLS-Auswertung](https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan), [Primärschlüssel von Backuptabellen](https://supabase.com/docs/guides/database/database-linter?lint=0004_no_primary_key). Diese Änderung führt keine Tabellen, Indizes, Funktionen oder Berechtigungen ein.

## Rücknahme

Bei einem bestätigten Scheduler-Problem kann der Job-Befehl mit `cron.alter_job` auf den bisherigen unbedingten `net.http_post`-Aufruf zurückgestellt werden; URL und Worker-Secret weiterhin ausschließlich über die vorhandenen Vault-Namen beziehen. Keine Outbox-Daten oder Retry-Zähler zurücksetzen. Das erneute Ausführen des kompletten Installationsskripts ist für die Rücknahme nicht erforderlich. Die Frontend-Änderung kann separat über Vercel oder einen Git-Revert zurückgenommen werden.
