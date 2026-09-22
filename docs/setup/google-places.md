# Google Places Adresshilfe aktivieren

Die Implementierung ergänzt das Straßenfeld im Bestellformular. Ohne `VITE_GOOGLE_MAPS_API_KEY` bleibt die normale manuelle Eingabe aktiv. Ein Key ist noch nicht eingerichtet; echte Google-Abfragen sind daher noch nicht verifiziert.

## Google Cloud

1. In https://console.cloud.google.com/ ein Projekt für AKRIA erstellen und ein Abrechnungskonto verbinden.
2. **Maps JavaScript API** und **Places API (New)** aktivieren.
3. Unter APIs und Dienste → Anmeldedaten einen API-Key erstellen.
4. Anwendungseinschränkung **Websites / HTTP-Verweis-URLs** wählen und nur die tatsächlich verwendeten AKRIA-Domains erlauben (`https://<domain>/*`, gegebenenfalls zusätzlich `www`). Für lokale Entwicklung einen getrennten Key mit `http://localhost:5173/*` und `http://127.0.0.1:5173/*` verwenden. Keine pauschale Freigabe für alle Vercel-Projekte.
5. API-Einschränkungen auf **Maps JavaScript API** und **Places API (New)** setzen. Kontingente und Budgetbenachrichtigungen einrichten; Budgetbenachrichtigungen sind kein harter Kostenstopp.

## Website

Im Repository-Verzeichnis in `.env.local` ergänzen:

```dotenv
VITE_GOOGLE_MAPS_API_KEY=hier_den_eingeschraenkten_browser_key_eintragen
```

Danach den Entwicklungsserver neu starten. Für Produktion dieselbe Variable in den Vercel-Projekteinstellungen setzen und neu bauen/deployen. Der Browser-Key ist im ausgelieferten JavaScript sichtbar; deshalb sind die Domain- und API-Einschränkungen erforderlich. Keine Server-Schlüssel verwenden.

Die Hinweise in der Datenschutzseite beschreiben den Datenfluss. Vor Aktivierung muss der Betreiber die Rechtsgrundlage und eine gegebenenfalls erforderliche Einwilligung für seine Google-Vertragskonstellation klären und die Erklärung entsprechend vervollständigen. Die aktuelle Integration sendet ab drei eingegebenen Zeichen Anfragen; sie enthält keine vorgeschaltete Einwilligungsabfrage.

## Abnahme nach Einrichtung

- Deutsche und Schweizer Adresse suchen, Vorschlag per Maus, Touch und Tastatur wählen; Straße, Hausnummer, PLZ, Ort und Land kontrollieren.
- Nur eine Straße auswählen: fehlende Hausnummer bleibt leer und muss ergänzt werden.
- Vorschläge ignorieren und manuell ausfüllen; bei blockiertem Google muss das Bestellen weiterhin möglich sein.
- Auf dem echten Produktionshost Domain-Einschränkungen und Google-Abrechnung kontrollieren. Keine reale Bestellung nur für diesen Test auslösen.

## Technische Prüfungen

`npm run typecheck`, `npm run build`, `CI=1 npm run test:browser`.
Die Browsertests starten mit einem falschen Test-Key und simulieren Google. Sie dürfen keinen echten Google-Aufruf oder eine echte Bestellung auslösen. Einen separat laufenden Server auf Port 4173 vor den Tests beenden.

Es werden nur `addressComponents` geladen, keine Karte. Session-Tokens verbinden Vorschläge und Detailabruf. Manuelle Korrekturen und unklare Bestellstatus bleiben geschützt. Zum Abschalten Variable entfernen und neu deployen.
