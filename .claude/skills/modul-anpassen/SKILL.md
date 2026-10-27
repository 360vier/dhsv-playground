---
name: modul-anpassen
description: Bestehendes Modul (Gutenberg-Block) für eine Idee anpassen – als Override, mit Vorher/Nachher-Vergleich und Diff für die Entwicklung.
audience: alle
order: 30
---

# /modul-anpassen

## Für Menschen

Sag, welches Modul sich wie ändern soll, zum Beispiel:

> /modul-anpassen cta – Bild soll rund sein und es soll ein zweiter Button „Termin buchen“ dazukommen

Claude kopiert das Modul in deine Idee und ändert nur die Kopie. Alle anderen Seiten und Ideen bleiben unberührt. In der Toolbar schaltest du mit **Vorher** zwischen Original und Anpassung um. Entwickler sehen unter **Dev** den genauen Unterschied.

Ohne eigene Seite: Claude legt eine kleine Demo-Seite an, auf der das Modul in seinen Varianten zu sehen ist.

## Ablauf für Claude

1. Idee klären und auf ihren Branch wechseln (CLAUDE.md §1/§5). Status prüfen.
2. Modul finden: `ls modules/`, `/module/` oder die Klasse `wp-block-dhsv-<name>` im Live-HTML.
3. Override anlegen, und zwar **nur** so, damit der Baseline-Fingerprint für die Drift-Erkennung gespeichert wird:
   ```bash
   yarn idea override <slug> <modul>
   ```
4. Ändere nur `ideas/<slug>/modules/<modul>/`:
   - `block.json`: neue Attribute mit `type` und `default`; bestehende Attribute nicht umbenennen, das würde bestehende Inhalte brechen
   - `template.njk`: Struktur so nah wie möglich am Original lassen, damit der Diff klein bleibt
   - `style.scss` bzw. `styles.scss`: Theme-Tokens; Breakpoints wie im Original
   - `scripts.js`: Achtung, das Theme-JS kommt von der Live-Seite. Eine geänderte `scripts.js` wird im Playground nicht automatisch ausgeführt. Beschreib das Verhalten im README und frag bei Bedarf eine Entwicklerin oder einen Entwickler.
5. Prüf das Rendering mit `yarn render-module <modul> '{…}' --idea <slug>`. Gibt es noch keine Seite, leg eine Demo-Seite an: `yarn idea page <slug> demo --title "Demo <modul>"` mit dem Modul in allen relevanten Varianten.
6. README „Umsetzung im Theme“: Datei, neue Attribute, Migrationshinweis (bestehende Instanzen), betroffene Contracts.
7. `yarn idea note <slug> "<modul>: <was>"`, danach prüfen, committen und pushen.
