# MR Beauty Onepage – Korrektur V116

Grundlage: gelieferte Originalwebsite aus Commit `2055452dfb989f5b046c88cf3ca2176892c32058` (V114), nicht die zuvor neu gestalteten Entwürfe.

## Änderungen

- Zwei Originalfotos ergänzt, ohne Bildgenerierung oder Veränderung der JPEGs:
  - `images/gelnaegel-babyblau-glitzer-square.jpg` – Babyblau mit Glitzerakzenten.
  - `images/gelnaegel-rose-nude-square.jpg` – Rosé-Nude in Square-Form.
- Die Galerie enthält jetzt zehn Fotos. Die neuen Fotos haben eigene Titel und Beschreibungen in der Grossansicht.
- Responsive Geräteerkennung verwendet die aktuelle Fenstergrösse statt Monitorabmessungen. Handy-/Tablet-Modus und Scrollcontainer werden beim Resize aktualisiert.
- Menüanker berücksichtigen den Navigationsabstand auch auf Desktop und Tablet. Impressum und Datenschutz verlinken auf die jeweiligen Abschnitte.
- Navigation weiterhin ausschliesslich mit Logo auf der linken Seite.
- V104-Schrift-/Geometrieinitialisierung beibehalten; Hero-Text wird während der Initialisierung kurz zurückgehalten, damit die Zwischenposition nicht sichtbar wird. Zeitbegrenzter Fallback verhindert dauerhaft unsichtbaren Text.
- Querformat-Herobild bleibt bildschirmbreit; der ursprüngliche Bildausschnitt auf Desktop bleibt erhalten.
- Grossansicht begrenzt, mit sichtbarem Schliessen-Button, Escape und Tastaturbedienung. Die vorhandenen Galerievorschaugrössen werden nicht verändert.
- Desktop-Preise ab 1101 Pixel: Nägel links über beide Reihen; Augenbrauen/Wimpernlifting rechts oben und Lehrlinge rechts unten. Schmalere Ansichten untereinander. Lange Leistungsnamen dürfen umbrechen.
- Wimpernlifting & färben weiterhin CHF 60.00. Keine Wimpernverlängerungen hinzugefügt.
- Geräte-Test: iPhone exakt 402 × 874 bzw. 874 × 402 CSS-Pixel. Der frühere Rahmen verkleinerte die tatsächliche iframe-Fläche um 4 Pixel; jetzt wird ein äusserer Umriss verwendet. Querformat-Safe-Areas von 62 Pixel pro Seite bleiben erhalten.
- Zusätzliche Prüfansichten für normale PC-Fenster mit 900 und 1100 Pixel Breite.

## Prüfung

Erfolgreich technisch geprüft:

- JavaScript-Syntax aller 197 Inline-Skriptblöcke (einschliesslich JSON-LD-Prüfung) und der zusätzlichen JavaScript-Datei.
- Lokale Datei-/Bild-/Schriftverweise und Zielabschnitte der Links von Impressum und Datenschutz.
- 14 Preisangaben gegen die vorgegebene Preisliste.
- Geräteerkennungslogik in 11 Fenster-/Touch-Konfigurationen.
- Vier aufeinanderfolgende Fenstergrössenänderungen mit Wechsel zwischen Desktop, Tablet und Handy.
- Zwölf Menüanker-Berechnungen für Desktop und Handy.

Keine visuelle Browserabnahme: Die Cloud-Browserumgebung hat die lokale Vorschau per URL-Sicherheitsrichtlinie blockiert. Echte iPhone-/iPad-Safari-Tests und die optische Kontrolle stehen deshalb noch aus. `geraete-test.html` ermöglicht die Kontrolle der CSS-Ansichten im eigenen Browser; sie ersetzt keinen Test auf einem realen Gerät.

## Verwendung

Die Dateien liegen wie in der Originalversion direkt im Hauptverzeichnis. Den vollständigen Inhalt dieses Pakets in das bestehende Onepage-Repository übernehmen, insbesondere auch `responsive-fixes.css`, `responsive-fixes.js` und die beiden neuen JPEG-Dateien. Vorhandene Domain-Konfiguration und GitHub-Einstellungen bleiben im Repository erhalten; das Paket stellt die Domain nicht um.
