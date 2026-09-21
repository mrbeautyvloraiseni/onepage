# MR Beauty KI-Chat – Firebase Function

Diese Dateien sind nur fuer das sichere Backend des KI-Chats auf
`/gelnaegel-regensdorf/`.

Projekt: `mr-beauty-apps`
Cloud-Function-Region: `europe-west6` (Zuerich)
KI-Backend: Vertex AI / Gemini
Modell: `gemini-3.5-flash-lite`
Gemini-Endpunkt: `eu` (EU-Multiregion)
Funktion: `mrBeautyChat`

Sicherheit:
- Kein Gemini-API-Key im Browser, in GitHub oder in einer lokalen Datei.
- Die Function nutzt Google Application Default Credentials ueber ein eigenes Dienstkonto.
- Dienstkonto: `mr-beauty-ai-chat@mr-beauty-apps.iam.gserviceaccount.com`
- Das Dienstkonto erhaelt nur die fuer Vertex AI benoetigte Rolle.
- Browser-Aufrufe sind nur von mrbeauty.ch / www.mrbeauty.ch erlaubt.
- Eingaben, Verlauf und Antworten sind bewusst begrenzt.
- Es gibt eine einfache In-Memory-Rate-Limitierung.
- Die Landingpage speichert den Chatverlauf nur waehrend der aktuellen Browser-Sitzung im Arbeitsspeicher; es gibt keine MR-Beauty-Chatdatenbank.

Deployment erst nach:
1. Vertex AI API aktivieren.
2. Dienstkonto erstellen.
3. `roles/aiplatform.user` an dieses Dienstkonto vergeben.
4. Funktionen installieren und deployen.
