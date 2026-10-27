---
name: module-sync
description: Blade-Views aus dem Theme nach template.njk übersetzen – für neue oder geänderte Module, damit sie im Playground mit eigenen Inhalten nutzbar sind.
audience: dev
order: 85
---

# /module-sync

## Für Menschen

Nur für die Entwicklung. Im Playground hat jedes Modul ein `template.njk`. Das ist eine Übersetzung der Blade-View des Themes. Ändert sich die View im Theme, markiert die Modulübersicht das Template als **veraltet**. Fehlt es ganz, zeigt das Modul nur ein Live-Beispiel.

> /module-sync faq-slider tabs

## Ablauf für Claude

1. Branch `core/module-sync-<module>` von `main`.
2. Pro Modul:
   - Lies `modules/<name>/source/index.blade.php` (plus Partials), `source/index.php` (Controller), `block.json` und `examples/*.html` (die echte Live-Ausgabe).
   - Schreib `modules/<name>/template.njk` nach dem Stil von `modules/cta/template.njk`:
     - `get_block_wrapper_attributes([...])` wird zu `{{ wrapper('…') }}`
     - `{!! x !!}` wird zu `{{ x | safe }}`, `@svg('a.b')` wird zu `{{ svg('a.b') }}`
     - Controller-Logik ohne WordPress-Abhängigkeit setzt du mit `{% set %}` um. WordPress-Abfragen (Posts, Medien, ACF) werden zu Attributen mit fertigen Daten. Das dokumentierst du oben im Template-Kommentar.
     - Klassen und Struktur müssen identisch zur Live-Ausgabe sein, sonst greifen Theme-CSS und -JS nicht.
   - Prüfen mit `yarn render-module <name>` und eigenen Attributen; die Struktur mit `examples/*.html` vergleichen.
   - In `modules/<name>/SOURCE.json` `templateTranslatedFrom` auf den aktuellen `viewHash` setzen.
3. `yarn build && yarn check`, die Modulseite `/module/<name>/` ansehen.
4. Commit `[core] template.njk für <module>` und PR mit Label `core`.
