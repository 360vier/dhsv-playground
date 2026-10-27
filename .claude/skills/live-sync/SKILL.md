---
name: live-sync
description: Playground mit Theme-Code und Live-Inhalten von 360vier.de aktualisieren (Module, Styles, Seiten, Header/Footer) – als Sync-Branch mit PR.
audience: dev
order: 80
---

# /live-sync

## Für Menschen

Nur für die Entwicklung. Holt den aktuellen Stand der Website in den Playground:

- **Theme** (aus `360vier/dhsv012`): Module (`block.json`, SCSS, Blade-Quelle), globale Styles, Fonts und Icons
- **Live-Seite** (360vier.de): alle Seiten, Header, Footer, das Theme-JS und Beispiele je Modul

Das läuft auch automatisch jede Woche per GitHub Action und erzeugt dann einen PR „Live-Sync“.

> /live-sync

## Ablauf für Claude

1. `git fetch && git switch main && git pull`, danach `git switch -c sync/live-$(date +%F)`.
2. Theme holen. Nutzt `../dhsv012`, falls vorhanden; mit `--pull` wird dort vorher `git pull` ausgeführt:
   ```bash
   yarn sync:theme
   ```
   Der lokale Checkout muss auf `main` stehen (oder dem Branch aus `playground.config.js`). Steht er auf einem Feature-Branch, frag nach.
3. Inhalte holen. Mit `WP_APP_USER` und `WP_APP_PASSWORD` in `.env` bzw. der Umgebung gibt es zusätzlich die Block-Grammar:
   ```bash
   yarn sync:content
   ```
4. Den Report von `sync:theme` auswerten:
   - **ohne template.njk / veraltet:** `/module-sync` für diese Module vorschlagen (eigener Commit)
   - **nicht mehr im Theme:** nachfragen, ob das Modul aus `modules/` entfernt werden soll; vorher prüfen, ob Ideen es nutzen
5. `yarn build && yarn check`. Prüf ein paar Seiten unter `/live/…` visuell, ob Header, Footer und Module stimmen.
6. Committen (`[core] Live-Sync <datum>`), pushen und einen PR mit Label `core` erstellen. Im PR-Text: Theme-SHA, Anzahl Seiten, Module mit Drift (`dist/ideas.json → drift`).
