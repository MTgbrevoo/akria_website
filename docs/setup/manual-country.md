# Manuelle Länderangabe

Unter „Land“ stehen Deutschland (`DE`), Schweiz (`CH`) und „Sonstige...“ zur Auswahl. Bei „Sonstige...“ erscheint ein Pflichtfeld für den Ländernamen. Der eingegebene Name wird im vorhandenen `country`-Textfeld gespeichert und auf der Bestätigung sowie in der Bestelleingangsbestätigung ausgegeben. Andere Länder bekommen keine deutsche oder Schweizer PLZ-Formatprüfung; PLZ bleibt ein Pflichtfeld. Google-Adressvorschläge bleiben für Deutschland und die Schweiz verfügbar und werden bei manueller Länderwahl abgeschaltet.

## Veröffentlichung

1. Migration `20260922135430_allow_manual_country.sql` in Supabase anwenden. Sie erweitert die bestehende Tabellen-Constraint und die `place_preorder`-Funktion. Rechte, Preisprüfung, Wiederholungsschutz und Mail-Outbox bleiben erhalten.
2. `orders-api` mit der erweiterten Länderprüfung und Länderanzeige deployen.
3. Erst danach das Frontend veröffentlichen. Ein Git-Push allein aktualisiert weder Datenbank noch Edge Function.

Die Migration und API sind mit bisherigen DE-/CH-Bestellungen kompatibel. Die Aufnahme einer Vorbestellung ist weiterhin keine Lieferzusage. Lokale Tests prüfen API, SQL-Persistenz, Mailinhalt und Browserablauf; echte Bestellungen werden dabei nicht ausgelöst.

## Live-Stand vom 22. September 2026

- `allow_manual_country` über das Supabase-Plugin im Projekt `khizcgryvscakouefofc` angewendet.
- `orders-api` Version 6 aktiv; veröffentlichter Quelltext entspricht der lokalen Datei. Bereits live vorhandene Mailtexte beibehalten.
- Speicherung und Mail-Payload für ein manuelles Land in einer zurückgerollten Transaktion geprüft; keine Testdaten verblieben und keine Mail ausgelöst.
- Öffentliche API akzeptiert internationale Adresse und liefert beim absichtlich falschen Preis erwartungsgemäß `409 price_changed`, ohne eine Bestellung anzulegen.
- `place_preorder` bleibt für `anon` und `authenticated` gesperrt.
- Die separate ältere Newsletter-Migration wurde nicht ausgeführt; die Länder-Migration enthält bereits die aktuelle Funktion ohne Newsletter-Anmeldung.
- Die zusätzliche Änderung der Vorbestellfrist wurde von der automatischen Freigabeprüfung zurückgewiesen und ist noch nicht angewendet.
- Advisor-Hinweise außerhalb dieser Änderung: Ausführungsrechte älterer Funktionen (`handle_new_sign_up`, `rls_auto_enable`) und deaktivierter Schutz vor kompromittierten Passwörtern. Hinweise: https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable und https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
