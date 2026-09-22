# Newsletter-Auswahl aus dem Bestellformular entfernen

Das Bestellformular erfasst keine Newsletter-Einwilligung mehr. Die API verlangt dieses Feld nicht und reicht es nicht an die Datenbank weiter. Es werden keine Bestätigungs- oder Abmeldetokens für Bestellungen erzeugt. Die Datenbank legt auch für alte Clients keine Newsletter-Anmeldungen, Einwilligungsereignisse oder Newsletter-Mails mehr an.

## Veröffentlichung

1. `supabase/migrations/20260922121348_remove_checkout_newsletter.sql` nach der Migration für kurze Bestellnummern anwenden.
2. `supabase/functions/orders-api/index.ts` als `orders-api` veröffentlichen.
3. Frontend veröffentlichen. Die bisherige API verlangt noch das Newsletter-Feld, deshalb muss die neue API zuerst bereitstehen.

Die ungenutzten RPC-Parameter bleiben für die Kompatibilität mit der bisherigen API bestehen. Die neue API ist ebenfalls mit der vorherigen Datenbankfunktion kompatibel, da sie keine Einwilligung weitergibt.

Bereits gespeicherte Bestellversuche behalten ihren ursprünglichen Request und Fingerprint ausschließlich zur sicheren Wiederholung. Das historische Newsletter-Feld löst keine Anmeldung mehr aus. Neue Bestellversuche enthalten es nicht.

Bestehende Newsletter-Abonnements, Bestätigungs- und Abmeldelinks sowie bereits eingereihte E-Mails bleiben erhalten. Historische Migrationen bleiben unverändert; bei einer Neuinstallation muss auch diese Migration angewendet werden.

## Lokale Prüfung

`npm test`, `npm run typecheck`, `npm run build` und `npm run test:browser` prüfen Bestellungen ohne Newsletter-Feld, alte Wiederholungen, fehlende Newsletter-Nebenwirkungen und bestehende Links.
