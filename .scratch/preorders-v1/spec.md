# Vorbestellungen V1

Status: ready-for-human

Vom Nutzer bestätigt. Implementiert; manuelle Einrichtung von Datenbank, Edge Function und Mailversand steht aus. Siehe `docs/setup/preorders-v1.md`.

## Vom Nutzer vorgegebener Umfang

- Den bisherigen Vormerkungsablauf auf tatsächliche Vorbestellungen umstellen.
- Vorname, Nachname, E-Mail-Adresse, Straße, Hausnummer, PLZ, Ort und gewünschte Anzahl 5-Liter-Bag-in-Box erfassen.
- Jede Vorbestellung erhält eine Bestell-ID und ist einem Kontakt zugeordnet.
- Kontakte anhand ihrer E-Mail-Adresse zuordnen: vorhandenen Kontakt verwenden oder neuen Kontakt anlegen.
- Mehrere Vorbestellungen eines Kontakts sind möglich.
- Nach erfolgreicher Aufgabe Bestellinformationen und einen Hinweis anzeigen, für Änderungen oder weitere Informationen AKRIA direkt zu kontaktieren.

## Im Interview festgelegt

- Zahlung bei Erhalt der Ware.
- Lieferung weiterhin im Frühjahr 2027; Abhol-Event oder Versand auf Kosten des Empfängers.
- Lieferländer ausschließlich Deutschland und Schweiz; Land im Formular erfassen.
- Die Liefermethode wird noch nicht bei Bestellung gewählt. Eine spätere Mail im Dezember/Januar fragt diese ab.
- Keine geschäftliche Obergrenze der Bestellmenge; auffällige Mengen werden manuell in Supabase geprüft und durch direkte Kontaktaufnahme geklärt.
- Produktbezeichnung: 5-Liter-Bag-in-Box.
- Gastbestellung ohne Login oder Bestätigungsklick: Die Bestellung wird unmittelbar gespeichert. Namen und Adresse werden je Bestellung festgehalten.
- Eine Bestelleingangsbestätigung per E-Mail gehört nun zu V1. Sie verlangt keinen Bestätigungsklick.
- Informationen über die nächste Ernte und neue Produkte (z. B. Flaschen) sind gewünscht. Separate freiwillige Newsletter-Anmeldung mit Double-Opt-in, unabhängig von der Bestellung. CTA: „Wir planen viel Neues. Dürfen wir dich informieren?“; ergänzender Textvorschlag: „Erhalte E-Mails zu kommenden Ernten und neuen AKRIA-Produkten. Jederzeit abmeldbar.“
- Bereits bestätigte Newsletter-Abonnenten müssen sich nicht erneut anmelden. Eine bei einer weiteren Bestellung nicht aktivierte Checkbox ist keine Abmeldung.
- Preis je 5-Liter-Bag-in-Box: 85 Euro bis einschließlich 15. November 2026, 95 Euro ab 16. November 2026, 00:00 Uhr deutscher/Schweizer Ortszeit. Das Datum kann sich ändern und muss zentral konfigurierbar sein.
- Für den Preis ist der serverseitige Eingang maßgeblich; der Stückpreis wird je Bestellung festgehalten. Ein Preiswechsel zwischen Öffnen und Absenden des Formulars verlangt eine ausdrückliche Bestätigung des neuen Preises.
- Fest vereinbarter Europreis auch für Schweizer Bestellungen. Eine mögliche spätere CHF-Zahlung ist nicht Teil des Bestellformulars.
- Der Kunde gibt eine verbindliche Bestellung ab. Die automatische Nachricht bestätigt nur den Eingang; die Lieferzusage erfolgt separat nach Prüfung durch AKRIA.
- Erneute bewusste Bestellung erzeugt eine weitere Bestellung: zwei Stück und später drei Stück ergeben zwei Zeilen mit insgesamt fünf Stück. Doppelklicks/technische Wiederholungen desselben Vorgangs erzeugen keine weitere Bestellung.
- Bestehende Kontaktdaten werden nicht allein aufgrund der eingegebenen E-Mail offengelegt.

## Ursprünglich außerhalb V1

- Bestätigungsmail war ursprünglich außerhalb V1; die Bestelleingangsbestätigung wurde im Interview ausdrücklich in V1 aufgenommen.
- Selbstständiges Ändern über einen eindeutigen Link.
- Empfehlungssystem mit individuellem Code und 5 Euro Rabatt für beide Beteiligten.

## Weitere bestätigte Entscheidungen

- Bestehende Kontaktangaben bei neuen Bestellungen nicht überschreiben. Für die Abwicklung gelten die Angaben an der jeweiligen Bestellung.
- Mailversandfehler lassen die gespeicherte Bestellung bestehen. Versand separat erneut versuchen; der Bildschirm zeigt Erfolg mit Bestell-ID.

## Technischer Umsetzungsvorschlag zur abschließenden Bestätigung

### Kontakte und Bestellungen

- `contacts` wird die fachliche Nachfolge von `sign_ups`, unabhängig von einem Auth-Konto. Bestehende IDs, Daten, Akquisitionsinformationen und Einwilligungsnachweise nach Möglichkeit erhalten. Konkrete Migration erst nach Prüfung produktiver Abhängigkeiten festlegen.
- Kontakt-E-Mail normalisieren (äußere Leerzeichen entfernen, Kleinschreibung), eindeutig machen und Kontaktanlage bei gleichzeitigen Bestellungen absichern. Keine anbieterspezifische Entfernung von Punkten oder Plus-Suffixen.
- Vor Migration Dubletten, leere E-Mails, Auth-Verweise, Trigger und RLS prüfen. Keine Daten oder Einwilligungsnachweise stillschweigend verwerfen.
- Bestellung: ID, verpflichtende Kontaktreferenz, Ernte/Kampagne, Namen, eingegebene E-Mail, Straße, Hausnummer, PLZ, Ort, Land, Stückzahl, Stückpreis, Währung EUR, Warenzwischensumme, Zeitpunkt und Status „eingegangen“.
- Namen, Adresse und Preis sind je Bestellung eigenständig gespeichert. Kontaktlöschung darf Bestellungen nicht automatisch kaskadierend löschen; Newsletter-Abmeldung ist unabhängig davon.
- Supabase zeigt jede Bestellung mit Namen, Menge und Kontaktreferenz. Keine eigene Verwaltungsoberfläche in V1.

### Preis, Speicherung und Versand

- Stichtag zentral konfigurierbar; initial 16. November 2026, 00:00 Uhr Europe/Berlin. Bereits gespeicherte Preise bleiben bei Änderung des Stichtags unverändert.
- Server validiert Pflichtfelder, Land, positive ganze Menge und Preis. Keine geschäftliche Mengenobergrenze; große gültige Mengen wie 1.000 akzeptieren.
- Kontaktzuordnung/-anlage, Bestellung und dauerhaften Versandauftrag atomar speichern. Erst danach Erfolg anzeigen.
- Pro Absendevorgang eindeutiger Schlüssel gegen doppelte Verarbeitung. Technische Wiederholung erzeugt keine zweite Bestellung; derselbe Schlüssel mit verändertem Inhalt wird nicht stillschweigend akzeptiert.
- Fehlgeschlagene Mails separat erneut versuchen; Versandstatus und Fehler für den Betrieb sichtbar machen. Dauerhaft fehlgeschlagene Zustellungen dürfen nicht unbemerkt bleiben.
- Öffentliche Clients dürfen keine Kontakte oder fremden Bestellungen auslesen. Bekannte E-Mail-Adressen geben keine gespeicherten Daten preis; keine vertraulichen Supabase-Schlüssel im Browser. Missbrauchsschutz für Bestell- und Mailversand berücksichtigen.

### Newsletter

- Eigene freiwillige, nicht vorausgewählte Checkbox mit vereinbartem CTA. Anmeldung und Bestätigung unabhängig von Bestellung und Bestellstatus.
- Einwilligungstext/-version, Anmeldung und Bestätigung nachvollziehbar erfassen; Abmeldung ermöglichen.
- Bestehende Nachweise erhalten. Ein bestätigtes Auth-Konto allein gilt nicht als Nachweis einer Newsletter-Einwilligung.

### Kundentexte und Bestätigung

- Vor Absenden Stückpreis, Menge, Warenzwischensumme und Währung anzeigen. Versandkosten sind noch nicht enthalten und bei später gewähltem Versand vom Empfänger zu tragen. Zahlung bei Erhalt, spätere Lieferauswahl und separate Lieferzusage erläutern.
- Bestätigungsbildschirm und Eingangsbestätigung zeigen Bestell-ID, Produkt, Menge, Namen, E-Mail, Adresse und gespeicherte Preise. Keine personenbezogenen Angaben in URLs oder durch öffentliches Nachschlagen einer Bestell-ID offenlegen.
- Textvorschlag: „Deine Bestellung ist eingegangen. Wir prüfen sie und bestätigen dir die Lieferung separat. Zur Auswahl zwischen Abholung und Versand melden wir uns im Dezember/Januar. Bezahlt wird bei Erhalt der Ware. Bei Änderungen oder Fragen kontaktiere uns bitte unter Angabe deiner Bestellnummer.“
- Vorgeschlagener Kontaktweg: bestehende öffentliche Adresse meyertiffertgbr@gmail.com.
- Bestehende Vormerkungs-, Preis- und Datenschutztexte auf den neuen Ablauf abstimmen. Vor Veröffentlichung Bestellbutton, Versandkostenhinweise und Vertragsinformationen auf diesen Ablauf prüfen.

## Technisch vor Umsetzung zu prüfen

- Produktive Tabellen, Trigger, RLS-Regeln, Auth-Abhängigkeiten und Datenqualität. Im Repository fehlen dazu Migrationen.
- Der bestehende Insert in `Success.tsx` lässt die laut bereitgestelltem Schema verpflichtende `sign_ups.id` aus. Produktive Trigger/Defaults müssen vor Migration geklärt werden.
- Verfügbarer Mailversand, Absenderkonfiguration und verlässlicher Mechanismus für Wiederholungen. Supabase-Auth-Mails nicht ungeprüft als allgemeinen Bestellmailer voraussetzen.
- Bestehende Newsletter-Bestätigungslinks bei Migration berücksichtigen.

## Abnahmefälle

1. Neuer Kontakt: eine Bestellung, ein Kontakt, ein Versandauftrag; Erfolg entspricht gespeicherten Daten.
2. Vorhandener Kontakt: neue Bestellung ohne Überschreiben des Kontakts oder früherer Bestellungen.
3. Zwei bewusste Bestellungen mit zwei und drei Stück: zwei Zeilen, derselbe Kontakt, insgesamt fünf Stück.
4. Doppelklick, Netzwerk-Wiederholung und parallele Kontaktanlage erzeugen keine unbeabsichtigten Duplikate.
5. Preise vor/nach Stichtag, geänderter Stichtag und über Preiswechsel geöffnetes Formular erfüllen die vereinbarten Regeln; historische Preise bleiben erhalten.
6. Ungültige Daten und manipulierte Preise werden serverseitig abgewiesen; große gültige Mengen akzeptiert.
7. Bestellung funktioniert ohne Newsletter. Neue Einwilligung braucht DOI, bestehende bestätigte Einwilligung bleibt erhalten.
8. Mailfehler verlieren keine Bestellung und lösen Wiederholungen aus. Speicherfehler zeigen keinen Erfolg.
9. Anonyme Zugriffe können keine Kontakte oder fremden Bestellungen lesen.

## Umsetzung

Implementierung und lokale Prüfung vorhanden. Produktive DB wurde nach Freigabe über das Dashboard migriert. Aktueller Einrichtungsstand: `docs/setup/deployment-status.md`.
