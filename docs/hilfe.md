## So funktioniert der Playground

1. **Eine Idee = ein Vorhaben.** Das kann eine neue Seite sein, ein neues Modul, eine Anpassung an einem bestehenden Modul oder eine Mischung davon. Jede Idee hat eine Autorin oder einen Autor, einen Status und einen Verlauf.
2. **Jede Idee ist ein eigener Branch** (`idea/<slug>`). Er wird bei jedem Push automatisch in `main` übernommen, deshalb sind hier immer alle Ideen zu sehen. Mehrere Personen kommen sich nicht in die Quere, weil jede Idee nur ihren eigenen Ordner ändert.
3. **Module sind die Gutenberg-Blocks der Website**, mit denselben Namen und derselben Struktur. Was hier entsteht, kann die Entwicklung direkt übernehmen.
4. **Kommentare** setzt du direkt auf Elemente: Taste **C**, dann klicken. Lokal werden sie sofort gespeichert, online kopierst du einen Prompt für Claude.
5. **Erst wenn die Entwicklung eine Idee umgesetzt hat**, wird ihr Branch gelöscht. Die Idee bleibt als Historie erhalten.

## Loslegen

**Lokal mit Claude Code Desktop** (empfohlen, weil du dort Kommentare direkt setzen kannst):

```bash
git clone git@github.com:360vier/dhsv-playground.git
cd dhsv-playground
yarn install
yarn dev
```

Dann im Browser http://localhost:4360 öffnen und in Claude z. B. `/idee-neu …` eingeben.

**In der Cloud** (claude.ai/code): eine Session auf dem Repo `360vier/dhsv-playground` starten und genauso mit `/idee-neu …` beginnen. Nach jedem Push ist der Stand nach etwa 2 Minuten hier online.

## Die Toolbar unten auf jeder Seite

| Element | Funktion |
| --- | --- |
| **Übersicht** | zurück zur Ideenliste |
| **Idee + Status** | zur Detailseite der Idee (Beschreibung, Verlauf, Dev-Ansicht) |
| **Seitenauswahl** | zwischen den Seiten einer Idee wechseln |
| **Vorher** | dieselbe Seite mit den Original-Modulen (nur bei Modulanpassungen) |
| **＋ Kommentar** / Taste **C** | Kommentar-Modus: auf ein Element klicken |
| **💬 n** | Liste der Kommentare dieser Seite |
| **Dev** | Diffs, Block-Markup und Checkliste für die Entwicklung |
| **◐** | Toolbar einklappen |

> Der Playground ist öffentlich erreichbar (aber nicht in Suchmaschinen). Bitte keine vertraulichen Inhalte eintragen.
