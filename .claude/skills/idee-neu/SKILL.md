---
name: idee-neu
description: Neue Idee im Playground anlegen – eigener Branch, Ordner, Status „Entwurf“. Immer der erste Schritt, bevor etwas gebaut wird.
audience: alle
order: 10
---

# /idee-neu

## Für Menschen

Sag Claude, was du ausprobieren möchtest, zum Beispiel:

> /idee-neu Karriere-Seite mit Video-Stage und Benefits-Kacheln

Claude legt die Idee an: Ordner `ideas/<slug>/`, Branch `idea/<slug>`, dich als Autor und den Status **Entwurf**. Danach fragt Claude, womit es losgehen soll, zum Beispiel mit einer neuen Seite, einer Kopie einer Live-Seite oder einer Modulanpassung. Nach dem ersten Push erscheint die Idee nach etwa 2 Minuten in der Übersicht.

## Ablauf für Claude

1. Kläre in **einer** Rückfrage, falls es unklar ist:
   - Titel (kurz, sprechend)
   - Ein-Satz-Zusammenfassung
   - Typ: `seite`, `modul`, `anpassung` oder `mix`
   - optional einen ClickUp-Ticket-Link

   Prüfe mit `yarn idea list`, ob es schon eine ähnliche Idee gibt. Wenn ja, frag, ob die Person dort weitermachen will.
2. Die Arbeitskopie muss sauber sein (`git status`). Ist sie es nicht, frag nach, statt fremde Änderungen zu committen.
3. Lege die Idee an:
   ```bash
   yarn idea new "<Titel>" --type <typ> --summary "<Satz>" [--ticket <url>]
   ```
   Das legt den Branch `idea/<slug>` von `origin/main` an.
4. Fülle `ideas/<slug>/README.md` aus dem Gespräch: Ziel, Beschreibung, offene Fragen.
5. Frag nach dem nächsten Schritt und nutze dafür den passenden Skill: `/seite-bauen`, `/modul-anpassen` oder `/modul-neu`.
6. Prüfen, committen und pushen:
   ```bash
   yarn check
   git add ideas/<slug> && git commit -m "[idea:<slug>] Idee angelegt"
   git push -u origin idea/<slug>
   ```
7. Nenne der Person den Link `https://360vier.github.io/dhsv-playground/ideen/<slug>/` und lokal `http://localhost:4360/ideen/<slug>/`, falls `yarn dev` läuft.
