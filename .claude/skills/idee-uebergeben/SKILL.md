---
name: idee-uebergeben
description: Freigegebene Idee für die Entwicklung vorbereiten – Übergabe-Doku vervollständigen, Contracts prüfen, Status „In Umsetzung“ setzen.
audience: alle
order: 60
---

# /idee-uebergeben

## Für Menschen

Wenn eine Idee freigegeben ist:

> /idee-uebergeben karriere-video-stage

Claude prüft, ob die Entwicklung alles hat: Beschreibung, neue Felder, Verhalten, offene Kommentare und Checkliste. Danach gibt Claude der Entwicklerin oder dem Entwickler eine Zusammenfassung mit Links. Der Status wechselt auf **In Umsetzung**, sobald die Entwicklung übernimmt. Ab dann ist die Idee gesperrt.

## Ablauf für Claude

1. Idee und Branch wie gewohnt. Status muss `freigegeben` sein; sonst nachfragen.
2. Prüfen und ggf. ergänzen:
   - **Keine offenen Kommentare.** Sonst erst `/kommentare-abarbeiten` oder bewusst als „wird im Theme gelöst“ beantworten.
   - `yarn check` ist grün, keine Drift-Warnung. Gibt es Drift, Override gegen die aktuelle Baseline abgleichen.
   - README „Umsetzung im Theme“ vollständig: jede geänderte oder neue Datei mit Zielpfad im Theme (`resources/assets/gutenberg/blocks/<name>/…`), neue Attribute inkl. Editor-Control (TextControl, MediaUpload, LinkControl …), JS-Verhalten, Inhalte und Seiten, die in WordPress angelegt werden müssen.
   - Contracts aus `playground.config.js → handoffChecklist` einzeln bewerten und im README vermerken (zutreffend / nicht zutreffend).
3. Gib eine Zusammenfassung für die Entwicklung aus: Link `/ideen/<slug>/#entwickler` (Diffs, Block-Markup, Checkliste), Link auf den Compare `main...idea/<slug>`, die wichtigsten Punkte.
4. Frag, wer übernimmt. Wenn die Entwicklung übernimmt:
   ```bash
   yarn idea status <slug> in-umsetzung --note "übernommen von <name>" [--ticket <url>]
   ```
   Danach committen und pushen.
