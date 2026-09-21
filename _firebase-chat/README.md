# MR Beauty KI-Chat – Firebase Function

Diese Dateien sind nur fuer das sichere Backend des KI-Chats auf
`/gelnaegel-regensdorf/`.

Projekt: `mr-beauty-apps`
Region: `europe-west6` (Zuerich)
Funktion: `mrBeautyChat`

Wichtig:
- Niemals einen OpenAI API-Key in HTML, JavaScript oder GitHub speichern.
- Der Key wird als Firebase Secret `OPENAI_API_KEY` gesetzt.
- Die Funktion akzeptiert Browser-Aufrufe nur von mrbeauty.ch / www.mrbeauty.ch.
- OpenAI Responses werden mit `store:false` angefordert.
- Die Funktion begrenzt Eingaben und Antwortlaenge und besitzt eine einfache In-Memory-Rate-Limitierung.

Deployment wird erst durchgefuehrt, nachdem der API-Key als Secret hinterlegt wurde.
