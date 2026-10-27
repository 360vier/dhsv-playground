---
name: idee-abschliessen
description: Nach der Umsetzung im Theme – Idee auf „Umgesetzt“ setzen, Theme-PR verlinken und den Idee-Branch löschen.
audience: dev
order: 70
---

# /idee-abschliessen

## Für Menschen

Nur für die Entwicklung. Wenn die Idee im Theme umgesetzt und live ist:

> /idee-abschliessen karriere-video-stage https://github.com/360vier/dhsv012/pull/123

Die Idee wechselt auf **Umgesetzt** und der Theme-PR wird verlinkt. Der Branch `idea/<slug>` wird gelöscht. Der Ordner bleibt als Historie in `main` und in der Übersicht unter „Umgesetzt“.

## Ablauf für Claude

1. Voraussetzungen prüfen:
   - Status ist `in-umsetzung`.
   - Der Theme-PR ist gemerged. Prüfen mit `gh pr view <url> --json state,mergedAt`. Ist er nicht gemerged, abbrechen und Bescheid geben.
2. Auf den Branch der Idee wechseln und pullen. Dann:
   ```bash
   yarn idea status <slug> umgesetzt --pr <theme-pr-url> --note "umgesetzt in <theme-pr>"
   yarn check
   git add ideas/<slug> && git commit -m "[idea:<slug>] umgesetzt"
   git push
   ```
3. Warte, bis die CI den Stand nach `main` gemerged hat. Prüfen mit `gh pr list --head idea/<slug> --state merged` und `git fetch && git show origin/main:ideas/<slug>/idea.json`, der Status muss dort `umgesetzt` sein.
4. **Erst dann**, und nach Bestätigung durch die Person, den Branch löschen:
   ```bash
   git switch main && git pull
   git push origin --delete idea/<slug>
   git branch -D idea/<slug>
   ```
5. Wurden Module angepasst, weise darauf hin, dass beim nächsten `/live-sync` die Baseline das neue Theme-Modul enthält. Andere Ideen mit Override auf dasselbe Modul bekommen dann eine Drift-Warnung. Das ist gewollt.
