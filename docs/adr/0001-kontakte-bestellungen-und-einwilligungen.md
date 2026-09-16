---
status: accepted
---

# Kontakte, Bestellungen und Newsletter-Einwilligungen getrennt führen

Der bisherige Vormerkungsablauf koppelt Kontakte über `sign_ups.id` an Supabase Auth und legt sie bereits bei der Auth-Benutzeranlage an; die E-Mail-Bestätigung folgt später. Für Gastbestellungen werden Kontakte künftig unabhängig von Auth geführt, anhand normalisierter E-Mail zugeordnet und mit mehreren Bestellungen verknüpft; jede Bestellung bewahrt ihre eigenen Namen, Adress- und Preisangaben, damit spätere Eingaben bestehende Bestellungen oder fremde Kontaktangaben nicht überschreiben.

Newsletter-Double-Opt-in bleibt eine separate Einwilligung und ist keine Voraussetzung einer Bestellung. Diese Trennung erlaubt einen unmittelbaren Bestelleingang, nimmt dafür unbestätigte Bestelladressen in Kauf und erfordert die sorgfältige Migration bestehender Auth-Verweise und Einwilligungsnachweise. Bestellungen werden nicht durch Kontaktlöschung automatisch kaskadierend entfernt.
