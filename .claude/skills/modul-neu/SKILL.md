---
name: modul-neu
description: Neues Modul (Gutenberg-Block) in einer Idee entwerfen – block.json, Template, Styles in Theme-Struktur.
audience: alle
order: 35
---

# /modul-neu

## Für Menschen

Beschreib das neue Modul: Was zeigt es, welche Inhalte soll die Redaktion pflegen können, wie verhält es sich mobil? Zum Beispiel:

> /modul-neu „Kennzahlen-Band“: 3–4 große Zahlen mit kurzer Beschreibung, dunkler Hintergrund, zählt beim Scrollen hoch

Claude legt das Modul in deiner Idee an, baut es auf einer Demo-Seite ein und dokumentiert, was die Entwicklung für den echten Block braucht. Wichtig: Alles, was die Redaktion ändern können soll, wird ein Feld (Attribut).

## Ablauf für Claude

1. Idee klären und Branch wechseln (CLAUDE.md §1/§5).
2. **Vorher prüfen**, ob ein bestehendes Modul das schon kann, eventuell mit Anpassung (`modules/*/block.json`, `/module/`). Wenn ja, schlag das vor. Weniger Module ist besser.
3. Lege das Modul an. Der Name ist kebab-case, englisch wie die Theme-Blocks:
   ```bash
   yarn idea module <slug> <name> --title "<Titel>"
   ```
4. Schreib:
   - `block.json`: alle redaktionellen Inhalte als Attribute mit `default`, dazu `example.attributes` mit realistischem Inhalt (wird auf der Modulseite gezeigt)
   - `template.njk`: Wrapper über `{{ wrapper('…') }}`, BEM-artige Klassen mit dem Modulnamen als Präfix, Icons über `svg('icons.…')`, Buttons mit `dhsv-button primary|secondary`
   - `style.scss`: wird automatisch gescopt; nur Tokens; mobil zuerst
   - Verhalten (Animation, Interaktion) beschreibst du im README. Eine `scripts.js` darfst du als Prototyp anlegen; sie wird im Playground **nicht** automatisch geladen. Dafür einen Hinweis an die Entwicklung schreiben.
5. Demo-Seite mit dem Modul: `yarn idea page <slug> demo` und Block-Grammar `<!-- wp:dhsv/<name> {…} /-->`.
6. README „Umsetzung im Theme“: Block-Typ (PHP/Blade, InnerBlocks oder React), Attribute, Editor-Controls, JS-Verhalten, Contracts (LCP-Bild, Lazy-Import, React-Allowlist, WPML-Link-Attribute).
7. `yarn idea note …`, prüfen, committen und pushen.
