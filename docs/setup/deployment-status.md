# Einrichtung AKRIA – 16. September 2026

Zielprojekt: `khizcgryvscakouefofc` (Supabase Produktion). Keine CLI-Verknüpfung geändert.

## Eingerichtet und geprüft

- Migration `01-preorders.sql` erfolgreich ausgeführt, einschließlich geschützter Sicherung im Schema `akria_preorders_backup_20260916`. Nicht erneut ausführen; Korrekturen als Folgemigration bereitstellen.
- Kontakte unabhängig von Auth übernommen. Bestehende Newsletter-Einwilligungen nur bei tatsächlich bestätigter Auth-E-Mail als bestätigt importiert.
- Bestehender Auth-Trigger legt sign_ups bereits vor E-Mail-Bestätigung an. Die Migration berücksichtigt das; der ergänzende Bestätigungstrigger erhält alte Anmeldungen und reaktiviert keine Abmeldungen.
- Anonyme Rolle kann Kontakte nicht lesen und `place_preorder` nicht direkt ausführen.
- Edge Function `orders-api` deployt, Runtime-Secrets manuell im Dashboard gesetzt. Worker hat eigene Authentifizierung; öffentliche Gast-Routen erfordern keinen Gateway-JWT.
- Live-Preisabruf mit lokalem Origin liefert HTTP 200 und 85 EUR; 95 EUR ab 16. Dezember 2026, 00:00 Uhr Europe/Berlin.
- Resend-Domain `akria.de` verifiziert. Scheduler ruft den Worker jede Minute auf; tägliche Bereinigung der Rate-Limit-Daten eingerichtet. Worker-Geheimnis liegt in Vault.
- Live-Test mit freigegebener Betreiberadresse: bestehender Kontakt wiederverwendet, wiederholter Request liefert dieselbe Bestell-ID. Testbestellung anschließend auf `cancelled` gesetzt.
- Eingangsbestätigung durch Cron beim ersten Versuch versendet, laut Resend zugestellt. Bereits bestätigte Newsletter-Einwilligung unverändert; korrekt kein erneuter DOI-Versand.
- Typecheck, 13 Backend-/Datenbanktests und Produktionsbuild erfolgreich. Browserabläufe lokal mit simuliertem Backend geprüft.

## Noch offen

- Neuer Newsletter-DOI-Ablauf ist bislang lokal getestet, nicht mit einem neuen Live-Abonnenten.
- Frontend-Veröffentlichung im Hosting überprüfen.

## Geheimnisse

Keine serverseitigen Zugangsdaten ins Repository kopieren. Temporäre Einrichtungsdateien liegen außerhalb des Repositories. Die bereits getrackte `.env` enthält nur öffentliche Supabase-Frontend-Konfiguration. `.gitignore` schützt weitere env-Dateien, entfernt aber bereits getrackte Dateien nicht.
