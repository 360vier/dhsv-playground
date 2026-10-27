---
name: seite-bauen
description: Seite in einer Idee bauen oder ändern – neu aus Modulen oder als Kopie einer Live-Seite, im Gutenberg-Block-Format.
audience: alle
order: 20
---

# /seite-bauen

## Für Menschen

Beschreib die Seite in eigenen Worten, mit Inhalten, Reihenfolge und Stimmung, zum Beispiel:

> /seite-bauen Neue Seite „KI-Workshop“: Stage mit Headline und Termin-Button, drei Nutzen-Kacheln, FAQ, CTA mit Hans

Oder auf Basis einer bestehenden Seite:

> /seite-bauen Kopie der Live-Seite „agentur“, aber die Team-Sektion weiter nach oben

Claude baut die Seite aus den vorhandenen Modulen (Übersicht unter **Module**) und zeigt sie dir lokal oder nach dem Push online. Unten auf jeder Seite gibt es eine Toolbar. Mit der Taste **C** setzt du Kommentare direkt auf Elemente.

## Ablauf für Claude

1. Idee klären. Ohne Idee zuerst `/idee-neu`. Danach `git fetch && git switch idea/<slug> && git pull`. Prüf den Status: Bei `in-umsetzung`, `umgesetzt` oder `verworfen` brichst du ab.
2. Lies `https://www.360vier.de/design.md` und verschaff dir einen Überblick über die Module: `ls modules/`, `modules/<name>/block.json` (Attribute) und `modules/<name>/examples/*.html` (wie es live aussieht).
3. Seite anlegen:
   - neu: `yarn idea page <slug> <seitenname> --title "<Titel>"`
   - Kopie einer Live-Seite: `yarn idea page <slug> <seitenname> --from-live <live-slug> --title "<Titel>"`

   Liegt eine `.blocks.html` vor, ist die Kopie echte Block-Grammar. Sonst ist es gerenderte HTML, die als Freeform durchgereicht wird. Abschnitte, die sich ändern, baust du dann als `<!-- wp:dhsv/… -->` Blocks neu.
4. Schreib `ideas/<slug>/pages/<seitenname>.html` in Gutenberg-Block-Grammar:
   - Module: `<!-- wp:dhsv/<name> {"attr":"wert"} /-->`, Container mit Inhalt: `<!-- wp:dhsv/<name> {…} -->…<!-- /wp:dhsv/<name> -->`
   - Core-Blocks mit gespeichertem HTML, z. B. `<!-- wp:heading {"level":2} --><h2 class="wp-block-heading">…</h2><!-- /wp:heading -->`
   - Nur Attribute verwenden, die in `block.json` stehen.
   - Module ohne `template.njk` (siehe `/module/`) zeigen nur ihr Live-Beispiel. Brauchst du dort eigene Inhalte, frag nach einer Modulanpassung oder nimm ein anderes Modul.
5. Sieht die Seite mit bestehenden Modulen nicht wie gewünscht aus, schlag `/modul-anpassen` oder `/modul-neu` vor. Keine Inline-Styles als Workaround.
6. README pflegen: Seitenaufbau unter „Beschreibung“, Neues unter „Umsetzung im Theme“. Dann `yarn idea note <slug> "Seite <name> gebaut"`.
7. Prüfen, committen und pushen wie in CLAUDE.md §5. Link zur Seite nennen: `/ideen/<slug>/<seitenname>/`.
