# Vorbestellungen V1 manuell einrichten

Die Website ist implementiert, aber erst nach vollständiger Einrichtung betriebsbereit. Der aktuelle Fortschritt steht in [deployment-status.md](deployment-status.md). Die Datenbankmigration wurde am 16. September 2026 über das Dashboard ausgeführt; die folgende Anleitung bleibt als Referenz erhalten. Keine Supabase-CLI-Verknüpfung wurde geändert. Bereits ausgeführte Einmalskripte nicht wiederholen. Zielprojekt anhand Supabase Dashboard → Project Settings → Project URL prüfen. Die bisherige Website verwendet `khizcgryvscakouefofc`; bei anderem Ziel auch `VITE_SUPABASE_URL` und `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` im Frontend ändern.

## 1. Datenbank vorbereiten

1. Sicherung der vorhandenen Daten im Betreiberkonto erstellen; bestehende `sign_ups`-/`orders`-Nutzung durch andere Anwendungen beachten.
2. [00-preflight.sql](../../supabase/manual/00-preflight.sql) vollständig im SQL-Editor ausführen. Es liest nur Schema, Zähler und Abhängigkeiten. Leere oder doppelte E-Mails müssen vor der Migration bewusst bereinigt werden. Bei zusätzlichen Triggern oder Fremdschlüsseln ihre Auswirkungen prüfen; der bestätigte Live-Trigger `handle_new_sign_up()` legt sign_ups bereits vor dem DOI an. Das Migrationsskript berücksichtigt diesen Ablauf.
3. [01-preorders.sql](../../supabase/manual/01-preorders.sql) vollständig als Rolle `postgres` ausführen. Dieses Skript ist **einmalig** und atomar. Bei Fehler wird nichts teilweise migriert; gegebenenfalls `rollback;` ausführen. Nicht einzelne Abschnitte wiederholt starten.

Ergebnis: `contacts` übernimmt vorhandene Kontakte und IDs; `orders` erhält Bestell-Schnappschüsse und eine Kontaktreferenz ohne Löschkaskade. `sign_ups` bleibt für die bisherige Website mit den bestehenden, auf den eigenen Auth-Benutzer begrenzten RLS-Regeln erreichbar. Ein zusätzlicher Auth-Trigger übernimmt spätere Bestätigungen in die neue Newsletter-Verwaltung, ohne Abmeldungen zu reaktivieren. Auth-Benutzer werden nicht gelöscht. Vorhandene Marketing-Einwilligungen werden mit Herkunft `legacy-sign-ups` übernommen. Als bestätigt gelten nur Einträge mit tatsächlich bestätigter, passender Auth-E-Mail; die übrigen bleiben ausstehend. Der vorhandene Auth-Bestätigungszeitpunkt wird übernommen. Bitte vorhandene Nachweise dafür aufbewahren.

Eine bisherige Auth-Löschung löscht weiterhin den alten `sign_ups`-Archivdatensatz, nicht aber den neuen Kontakt oder dessen Bestellungen. Datenschutz-Löschanfragen müssen deshalb beide Bestände und gesetzliche Aufbewahrungspflichten berücksichtigen.

## 2. Edge Function im Dashboard anlegen

Unter **Edge Functions → Deploy a new function → Via Editor** eine Funktion namens **`orders-api`** anlegen. Den vollständigen Inhalt von [index.ts](../../supabase/functions/orders-api/index.ts) als `index.ts` einsetzen und deployen. Es werden keine zusätzlichen Dateien oder npm-Imports benötigt.

**Verify JWT / Verify JWT with legacy secret deaktivieren.** Gastbestellungen und Newsletter-Links benötigen keine Anmeldung. Die Mail-Worker-Route prüft stattdessen ein eigenes geheimes Token; die Legacy-Route prüft den Benutzer-Token explizit. Browser bekommen niemals den Service-Role-Key. Die DB-Funktionen sind für `anon` und `authenticated` gesperrt.

Unter **Edge Functions → Secrets** setzen:

| Secret | Wert |
| --- | --- |
| `SITE_URL` | Exakte öffentliche Website-Origin, z. B. `https://eure-domain.de`, ohne Pfad oder abschließenden Slash. Newsletter-Links führen dorthin. |
| `RESEND_API_KEY` | Resend API-Key mit Versandberechtigung. |
| `ORDER_FROM_EMAIL` | Absender auf einer in Resend verifizierten Domain, z. B. `AKRIA <bestellung@eure-domain.de>`. Kein unverifizierter Gmail-Absender. |
| `ORDER_WORKER_SECRET` | Zufälliges Geheimnis mit mindestens 32 Zeichen; auch für Schritt 3 verwenden. |
| `ORDER_RATE_LIMIT_SALT` | Anderes zufälliges Geheimnis mit mindestens 32 Zeichen. |
| `ALLOWED_ORIGINS` | Optional: weitere exakte Website-Origins, durch Komma getrennt, z. B. lokale Testseite. Keine Wildcards. |

Zwei Geheimnisse lassen sich beispielsweise jeweils mit `openssl rand -hex 32` lokal erzeugen. Sie nur ins Dashboard und für den Worker ins SQL-Skript einsetzen, nicht ins Repository oder Frontend.

`SUPABASE_URL` und `SUPABASE_SERVICE_ROLE_KEY` stellt Supabase der Funktion standardmäßig bereit. Nicht als `VITE_...` anlegen. Der bestehende Supabase-Auth-SMTP-Versand ersetzt nicht den hier verwendeten direkten Resend-API-Key.

Resend-Absenderdomain/DNS verifizieren. Die Antwortadresse ist die bestehende öffentliche Adresse `meyertiffertgbr@gmail.com`. Datenschutztext nennt Resend bereits; Betreibervereinbarungen und tatsächliche Konfiguration vor Veröffentlichung abgleichen.

## 3. Automatischen Mailversand einschalten

In [02-mail-scheduler.sql](../../supabase/manual/02-mail-scheduler.sql) genau zwei Werte einsetzen: Projekt-URL und dasselbe `ORDER_WORKER_SECRET`. Vollständig im SQL-Editor ausführen. Das Skript aktiviert Cron, pg_net und Vault, speichert das Geheimnis in Vault und ruft jede Minute den geschützten Worker auf. Falls Erweiterungen im Projekt nicht aktivierbar sind, im Supabase Dashboard unter Integrations/Database Extensions freischalten und erneut ausführen.

Bis zu zehn Mails pro Aufruf; Eingangs- und Newsletter-Mails sind getrennte Versandaufträge. Fehlgeschlagene Mails werden mit wachsendem Abstand wiederholt. Resend erhält pro Versandauftrag einen stabilen Idempotenzschlüssel. Nach zehn Versuchen oder 23 Stunden seit dem ersten Versuch stoppt die Automatik mit Status `failed`, damit die 24-Stunden-Deduplizierung beim Anbieter nicht unbemerkt überschritten wird.

**Betrieb:** `mail_outbox` und Cron Job History regelmäßig prüfen. `sent` bedeutet vom Versanddienst angenommen, nicht garantierte Postfachzustellung; Bounces stehen bei Resend. Dauerfehler stehen in `mail_outbox.last_error`. [03-operations.sql](../../supabase/manual/03-operations.sql) enthält Statusabfragen und die Bestellliste. Bei `failed` vor manuellem Neuversand erst bei Resend prüfen, ob die Mail bereits angenommen wurde. Nicht blind `first_attempt_at` zurücksetzen: Nach Ablauf des Deduplizierungsfensters könnte sonst eine zweite Mail entstehen. Absender während laufender Wiederholungen nicht wechseln, da Resend bei gleichem Idempotenzschlüssel identische Inhalte erwartet.

## 4. Frontend und Funktionsprüfung

Erst DB, Edge Function und Scheduler einrichten, dann das Frontend veröffentlichen. Im bestehenden Hosting-Workflow `pnpm install`, `pnpm run typecheck`, `pnpm test`, `pnpm build` ausführen. Browserpfad `/bestellen`; alte `/waitlist`-Links leiten dorthin weiter. Ohne erreichbare Backend-Konfiguration ist der Bestellbutton gesperrt und es wird kein ungesicherter Ersatzpreis verwendet.

Mit eigener Testadresse prüfen:

1. Zwei Stück ohne Newsletter bestellen: Erfolg mit Bestellnummer, ein Kontakt, eine Bestellung, eine Eingangsbestätigung. Keine Newsletter-Einwilligung.
2. Drei Stück mit derselben E-Mail bestellen: zweiter Bestelldatensatz, derselbe Kontakt, insgesamt fünf Stück. Andere Adressangaben dürfen die erste Bestellung und den Kontakt nicht überschreiben.
3. Newsletter freiwillig auswählen: separate Bestätigungsmail, Klick auf den Link öffnet eine Seite mit ausdrücklichem Bestätigungsbutton. `pending` wird erst nach diesem Klick `confirmed`. Bestellung bleibt davon unabhängig. Abmeldelink testen.
4. Im Testprojekt Netzwerkantwort nach Absenden unterbrechen und „Bestellstatus erneut prüfen“ nutzen: derselbe Vorgang liefert dieselbe Bestellnummer. Nicht durch absichtliches Löschen des Browser-Speichers einen neuen Vorgang beginnen.
5. Preiswechsel im Testprojekt über `preorder_settings` simulieren: alte offene Formulare müssen den neuen Preis bestätigen; historische Bestellpreise bleiben erhalten.
6. Mailzustellung und Cron-Aufrufe tatsächlich prüfen. Eine erfolgreiche lokale Prüfung ersetzt diesen Einrichtungstest nicht.

Beim Einführen bestehende Supabase-Auth-Redirects auf `/success` für bereits verschickte Links erhalten. Dieser Kompatibilitätsablauf ist zunächst 30 Tage nach Migration verfügbar (`preorder_settings.legacy_links_until`). Er bestätigt ausschließlich Neuigkeiten und schreibt nicht mehr in `sign_ups`. Der vollständige Umfang alter Links hängt von deren ursprünglicher Gültigkeit und Auth-Konfiguration ab.

## Lokale Gestaltungsvorschau

Mit laufendem Entwicklungsserver zeigt `/bestellen?vorschau=1` das Formular mit Beispielpreis 85 EUR und Mengenberechnung. Die Vorschau ist ausdrücklich markiert, ruft kein Bestellbackend auf und kann weder Bestellungen speichern noch Mails senden. Sie ist ausschließlich im Vite-Entwicklungsmodus aktiv; der Produktionsbuild ignoriert den Parameter.

## Stichtag später ändern

Im Table Editor `preorder_settings` die einzige Zeile bearbeiten oder die auskommentierte Anweisung aus `03-operations.sql` verwenden. `preorder_until` ist das **exklusive** Ende: `2026-12-16 00:00:00 Europe/Berlin` bedeutet 85 Euro einschließlich 15. Dezember. Website und Server verwenden dieselbe Konfiguration; Frontend liest sie regelmäßig neu. Ein bereits abgesendeter Auftrag behält seinen gespeicherten Preis.

## Newsletter und Aufbewahrung

Nur `newsletter_subscriptions.status = 'confirmed'` für spätere Marketing-Kampagnen verwenden. `contacts.marketing_consent` ist ausschließlich ein archivierter Altwert und darf nicht als aktuelle Versandliste verwendet werden. Die neue Bestellfunktion ist kein Kampagneneditor. Neue DOI-Mails enthalten einen Abmeldelink; für importierte Altkontakte und manuelle Abmeldungen steht der E-Mail-Kontakt zur Verfügung. `03-operations.sql` enthält eine passende manuelle Abmeldeanweisung. Bei einem späteren Newsletter-Tool diese Abmeldungen synchronisieren.

Rate-Limit-Daten werden täglich nach zwei Tagen gelöscht. Für Bestell-, Einwilligungs-, Archiv- und Versanddaten müssen Betreiber ihre fachlichen/gesetzlichen Aufbewahrungsfristen anwenden; das Setup löscht solche Daten nicht pauschal. Die genaue Kundeninformation zu Vertragsabschluss, Versandkosten und Pflichtinformationen vor Livegang anhand des tatsächlichen Angebots prüfen.

## Lokale Prüfung / Grenzen

`npm test` prüft den echten SQL-Migrationstext mit PGlite (lokales PostgreSQL) und den Edge-Handler mit simulierten HTTP-Diensten. `npm run typecheck` prüft Frontend und Edge Function. `npm run test:browser` prüft den Ablauf mit Playwright und lokal installiertem Google Chrome; alle externen Bestellaufrufe sind dabei simuliert und können keine echten Bestellungen auslösen. Live-Supabase, Vault/Cron-Erweiterungen, produktive Trigger und tatsächliche Resend-Zustellung werden dadurch nicht geprüft. Das SQL-Skript basiert auf dem vom Nutzer bereitgestellten Ausgangsschema und bricht bei unpassenden Voraussetzungen ab.

Offizielle Einrichtungsquellen: [Supabase Dashboard-Deployment](https://supabase.com/docs/guides/functions/quickstart-dashboard), [geplante Edge-Function-Aufrufe](https://supabase.com/docs/guides/functions/schedule-functions), [Resend-Idempotenz](https://resend.com/docs/dashboard/emails/idempotency-keys).
