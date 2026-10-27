---
name: idee-status
description: Status einer Idee ändern (Entwurf → In Arbeit → Review → Freigegeben …) oder den Stand aller Ideen zusammenfassen.
audience: alle
order: 50
---

# /idee-status

## Für Menschen

> /idee-status karriere-video-stage review – bitte Hans und Marcel anschauen

> /idee-status – was ist gerade in Arbeit?

Der Status zeigt allen, wo eine Idee steht:

- **Entwurf**: angelegt, noch nicht ernsthaft bearbeitet
- **In Arbeit**: es wird aktiv daran gebaut
- **Review**: bitte anschauen und kommentieren
- **Freigegeben**: Geschäftsführung bzw. Design sagen Ja, die Entwicklung kann übernehmen (siehe `/idee-uebergeben`)
- **In Umsetzung**: die Entwicklung baut es ins Theme ein, die Idee ist ab hier gesperrt
- **Umgesetzt**: live, der Branch ist gelöscht
- **Verworfen**: nicht weiterverfolgt, bleibt als Historie erhalten

## Ablauf für Claude

- **Übersicht:** `git fetch && git switch main && git pull`, dann `yarn idea list`. Gruppiere nach Status und nenne Autor und offene Kommentare (`comments.json`).
- **Status ändern:**
  1. Auf den Branch der Idee wechseln.
  2. Übergänge prüfen:
     - `freigegeben` setzen nur, wenn die Person sagt, dass sie freigeben darf (Geschäftsführung oder Design-Lead). Im Zweifel nachfragen.
     - `in-umsetzung` und `umgesetzt` setzt nur die Entwicklung (`/idee-abschliessen`).
     - Zurück aus einem gesperrten Status nur nach ausdrücklicher Bitte, mit Begründung in `--note`.
  3. Ausführen:
     ```bash
     yarn idea status <slug> <status> --note "<Begründung / wer soll schauen>"
     ```
  4. Committen (`[idea:<slug>] Status → <status>`) und pushen.
