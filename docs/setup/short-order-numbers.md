# Kurze Bestellnummern

Status: lokal implementiert und getestet; noch nicht veröffentlicht.

Neue Bestellungen erhalten eine zufällige Nummer im Format `AK-7K3M9P`.
Die sechs Zeichen verwenden `23456789ABCDEFGHJKLMNPQRSTUVWXYZ` (ohne 0, 1, I und O).
`orders.order_number` ist eindeutig und verpflichtend. Bei einer Kollision wiederholt
`place_preorder` den Insert mit einem neuen Code, höchstens 20-mal. Andere
Datenbankfehler werden nicht als Nummernkollision behandelt. Wiederholungen derselben
Bestellung liefern die gespeicherte Nummer und erzeugen keine weitere Mail.
Die Nummer ist eine Referenz für Rückfragen, kein Zugangs- oder Bestätigungstoken.

## Veröffentlichung

1. Zielprojekt und aktuellen Stand von `place_preorder` und `order_receipt` prüfen.
   Die Folgemigration setzt `supabase/manual/01-preorders.sql` voraus und ersetzt
   diese beiden Funktionen auf Basis dieses Repository-Stands. Abweichende spätere
   Änderungen vor dem Anwenden zusammenführen. Die ursprüngliche Migration nicht
   erneut ausführen.
2. Den geänderten Bestellnummern-Renderer in `orders-api` veröffentlichen.
   In der lokalen Datei bestehen außerdem bereits vorher vorhandene Mailtextänderungen;
   diese gehören nicht automatisch zu dieser Veröffentlichung.
3. Das Frontend veröffentlichen und den erfolgreichen Build prüfen. Es kann sowohl
   alte Antworten mit `id` als auch neue Antworten mit `order_number` anzeigen.
4. `supabase/migrations/20260921154632_short_order_numbers.sql` auf dem geprüften
   Zielprojekt einmalig anwenden. Es ist eine eigenständige, atomare Folgemigration
   zur bisherigen manuellen Einrichtung; nicht blind die gesamte CLI-Historie pushen.
5. Nummern und Berechtigungen prüfen; nach Veröffentlichung des Workers müssen neue
   Bestellbestätigungen denselben Code in API-Antwort und Mail-Payload führen.

```sql
select count(*) as bestellungen,
       count(order_number) as mit_nummer,
       count(distinct order_number) as eindeutige_nummern
from public.orders;

select has_function_privilege('anon',
  'public.place_preorder(jsonb,uuid,text,text,text,jsonb)', 'EXECUTE') as anon_darf_bestellen,
  has_function_privilege('authenticated',
  'public.place_preorder(jsonb,uuid,text,text,text,jsonb)', 'EXECUTE') as nutzer_darf_bestellen;
-- Alle drei Anzahlen müssen gleich sein; beide Berechtigungen müssen false sein.
```

## Bestehende Bestellungen

Die Migration ergänzt Nummern auch für bestehende Datensätze. UUIDs, Verknüpfungen
und bisherige Mail-Payloads bleiben erhalten. Bereits verschickte oder wartende alte
Mails verwenden weiter ihre ursprüngliche UUID; so ändert sich auch der Inhalt eines
bereits begonnenen Versandversuchs nicht durch die Nummernumstellung.
Alte im Browser gespeicherte Bestätigungen zeigen weiterhin ihre UUID.
Die operative Bestellliste in `supabase/manual/03-operations.sql` enthält nach der
Migration beide Referenzen, sodass Rückfragen mit alten Nummern zugeordnet werden können.

## Lokale Prüfung

`npm test` prüft unter anderem Kollisionen, Wiederholungen, den Datenbestand vor der
Migration, unveränderte alte Mail-Payloads und eingeschränkte RPC-Berechtigungen.
`npm run test:browser -- tests/browser/orders.spec.ts` prüft kurze Nummern,
Mail-Betrefflinks und alte gespeicherte Bestätigungen mit simuliertem Backend.
Zusätzlich: `npm run typecheck` und `npm run build`.
