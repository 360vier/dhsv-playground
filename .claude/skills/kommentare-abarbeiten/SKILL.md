---
name: kommentare-abarbeiten
description: Kommentare (Pins) einer Idee anlegen, beantworten, umsetzen und als erledigt markieren – auch aus kopierten Prompts von der Online-Version.
audience: alle
order: 40
---

# /kommentare-abarbeiten

## Für Menschen

**Kommentieren:** Öffne eine Seite deiner Idee, drück **C** (oder „＋ Kommentar“ in der Toolbar) und klick auf das Element. Es funktioniert wie in Figma. Dein Name kommt aus deinem GitHub-Account.

- **Lokal** (`yarn dev`): Der Kommentar wird sofort gespeichert. Danach sagst du Claude „Kommentare committen“.
- **Online** (GitHub Pages): Kommentare kannst du dort nur lesen. Beim Speichern kopierst du einen Prompt und fügst ihn in Claude ein. Claude legt den Kommentar dann an.

**Abarbeiten lassen:**

> /kommentare-abarbeiten karriere-video-stage

Claude geht alle offenen Kommentare durch, setzt sie um, fragt bei Unklarem nach und markiert jeden umgesetzten Kommentar als erledigt, mit Verweis auf den Commit.

## Ablauf für Claude

1. Idee und Branch wie in CLAUDE.md. Gesperrte Ideen: keine neuen Kommentare und keine Umsetzung.
2. **Kommentar aus einem Prompt anlegen.** Der Prompt enthält Anker-JSON. Übernimm es unverändert:
   ```bash
   yarn idea comment <slug> '{"action":"add","page":"<seite>","anchor":{…},"path":"…","xPct":…,"yPct":…,"snippet":"…","text":"…"}'
   ```
   Antworten gehen mit `{"action":"reply","id":"…","text":"…"}`, erledigt mit `{"action":"resolve","id":"…","commit":"<hash>"}`.
3. **Abarbeiten:** Lies `ideas/<slug>/comments.json` (nur offene, `resolved: false`). Pro Kommentar:
   - Element finden: `anchor.block` und `anchor.nth` geben das n-te Vorkommen des Moduls auf der Seite an, `path` den Pfad darin, `snippet` den Text zur Kontrolle.
   - Ist der Kommentar unklar, antworte mit einer Rückfrage (`reply`) und lass ihn offen.
   - Sonst umsetzen. Seite oder Override ändern, für Modul-Änderungen gilt `/modul-anpassen`.
4. Committe die Umsetzung zuerst (`[idea:<slug>] Kommentare umgesetzt: …`). Markiere dann jeden umgesetzten Kommentar mit dem Commit-Hash als erledigt und committe `comments.json` (`[idea:<slug>] Kommentare erledigt`).
5. Kommentare **nie** löschen oder von Hand in der JSON ändern.
6. Push. Fasse kurz zusammen, was umgesetzt wurde und was offen bleibt.
