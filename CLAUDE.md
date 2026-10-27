# CLAUDE.md – Regeln für die Arbeit im Playground

Dieses Repo ist ein **versionierter HTML-Playground** für die Website, die in `playground.config.js` steht (aktuell 360vier.de, Theme-Repo `360vier/dhsv012`). Designer, Geschäftsführung und Entwickler probieren hier mit dir **Ideen** aus: neue Seiten, neue Module und Modulanpassungen. Entwickler übernehmen fertige Ideen später ins WordPress-Theme.

Hier arbeiten **mehrere Menschen gleichzeitig**. Die folgenden Regeln sind deshalb **nicht verhandelbar**. Die CI (`yarn check`) setzt die wichtigsten davon durch. Wenn eine Anfrage eine Regel brechen würde, sag das und schlag den regelkonformen Weg vor.

## 1. Jede Arbeit gehört zu genau einer Idee

- Eine Idee besteht aus genau **einem Ordner** `ideas/<slug>/` und genau **einem Branch** `idea/<slug>`.
- Bevor du etwas änderst, klärst du, um welche Idee es geht. Gibt es sie noch nicht, legst du sie über `/idee-neu` an.
- Arbeite **ausschließlich** in `ideas/<slug>/` der aktuellen Idee und auf ihrem Branch. Wechsle vorher den Branch: `git fetch && git switch idea/<slug> && git pull`.
- **Niemals** ändern, weder auf Wunsch noch „nur kurz“:
  - `core/`, `theme/`, `modules/`, `layout/`, `pages/live/`, `.github/`, `playground.config.js`, `CLAUDE.md`, `.claude/`
  - den Ordner einer anderen Idee

  Änderungen am Playground selbst laufen über einen Branch `core/<thema>` mit Review durch einen Entwickler. Das ist kein Ideen-Workflow.
- Ideen mit Status `in-umsetzung`, `umgesetzt` oder `verworfen` sind **gesperrt**. Daran nichts mehr ändern außer Status und Verlauf. Wer weitermachen will, legt eine neue Idee an und verweist auf die alte.
- Fremde Ideen (Autor ist jemand anderes) nur nach ausdrücklicher Aufforderung bearbeiten. Du wirst dann als Mitwirkende Person eingetragen, das macht `yarn idea` automatisch.

## 2. Struktur = Theme-Struktur

Alles soll sich 1:1 ins Theme übernehmen lassen:

| Playground | Theme (`dhsv012`) |
| --- | --- |
| `ideas/<slug>/modules/<name>/block.json` | `resources/assets/gutenberg/blocks/<name>/block.json` |
| `…/template.njk` | `…/index.blade.php` (Nunjucks ≈ Blade: `{{ x }}` = `{{ }}`, `{{ x \| safe }}` = `{!! !!}`) |
| `…/style.scss` | `…/style.scss` (automatisch auf `.wp-block-dhsv-<name>` gescopt) |
| `…/styles.scss` | `…/styles.scss` (global in main.css, **selbst** scopen) |
| `…/scripts.js` | `…/scripts.js` |
| `ideas/<slug>/pages/<seite>.html` | Seiteninhalt (`post_content`) als Gutenberg-Block-Grammar |

- **Seiten** schreibst du in Gutenberg-Block-Grammar: `<!-- wp:dhsv/cta {"title":"…"} /-->`. Core-Blocks (`wp:paragraph`, `wp:heading`, `wp:group`, `wp:columns` …) schreibst du mit ihrem gespeicherten HTML, so wie WordPress es speichert.
- **Modulanpassung** heißt immer Override. Lege die Kopie mit `yarn idea override <slug> <modul>` an und ändere nur die Kopie. **Nie** `modules/` direkt ändern.
- **Neues Modul**: `yarn idea module <slug> <name>`. Danach `block.json`, `template.njk` und `style.scss` ausbauen.
- Jeder sichtbare Inhalt eines Moduls ist ein **Attribut in `block.json`** und wird nicht im Template hart codiert. Eine Ausnahme bilden feste UI-Texte über `__('…')`.
- Wrapper-Element immer mit `{{ wrapper('extra-klassen') }}`, das entspricht `get_block_wrapper_attributes()`.
- Bilder einer Idee liegen in `ideas/<slug>/assets/` und werden als `assets/<datei>` referenziert. Bilder der Live-Seite dürfen direkt verlinkt werden.

## 3. Design

- Vor jeder Gestaltung `https://www.360vier.de/design.md` lesen (Tokens, Komponenten, Motion, Tonalität).
- Nur **Theme-Tokens** verwenden: CSS-Variablen aus `theme/styles/common/_variables.scss` und `_typo.scss`, außerdem bestehende Utility-Klassen (`with-bg`, `bg-dark-gradient`, `dhsv-button primary|secondary|tertiary` …). Keine neuen Hex-Werte, Schriften oder Abstände erfinden. `yarn check` warnt bei Hex-Farben.
- Bestehende Module wiederverwenden, bevor du neue baust. Die Modulübersicht liegt unter `/module/`, die Beispiele unter `modules/<name>/examples/`.
- Keine neuen npm-Libraries. Ist eine Lib zwingend nötig, begründe das in `README.md` der Idee unter „Umsetzung im Theme“ (Perf-Contract: Libs über ~5 KB gz werden im Theme lazy geladen).
- Texte auf Deutsch, in der Tonalität aus design.md.

## 4. Dokumentation wächst mit

Bei **jeder** Änderung an einer Idee:

1. Aktualisiere `idea.json`. Das läuft über `yarn idea …` (Status, Seiten, Overrides, Verlauf), oder du ergänzt per `yarn idea note <slug> "…"` einen Verlaufseintrag.
2. Aktualisiere `README.md` der Idee: Ziel, Beschreibung, Entscheidungen und vor allem die Tabelle **„Umsetzung im Theme“**. Dort steht für Entwickler, welche Datei im Theme betroffen ist, welche Attribute neu sind, welches JS-Verhalten erwartet wird und welche Perf-/WPML-Contracts greifen.
3. Seitentitel stehen in `idea.json → pages`.

## 5. Git-Ablauf

```bash
git fetch origin && git switch idea/<slug> && git pull   # vor der Arbeit
yarn check                                               # vor jedem Commit
git add ideas/<slug> && git commit -m "[idea:<slug>] <was geändert wurde>"
git push -u origin idea/<slug>                           # CI prüft und merged automatisch nach main
```

- Committe **nur** `ideas/<slug>/`. Kein `git add -A` und kein `git add .`.
- Commit-Format: `[idea:<slug>] <Beschreibung auf Deutsch>`.
- Kein Force-Push, kein Rebase auf `main`, keine Branches anderer Ideen löschen.
- Den Branch löscht **nur** die Entwicklung nach der Umsetzung (`/idee-abschliessen`).
- Nach dem Push ist die Idee nach etwa 2 Minuten auf GitHub Pages sichtbar. Teile dem Menschen den Link mit: `https://<owner>.github.io/<repo>/ideen/<slug>/`.

## 6. Kommentare

- Kommentare stehen in `ideas/<slug>/comments.json` und werden **nur** über `yarn idea comment <slug> '<json>'` geändert oder lokal über das Overlay im Dev-Server. Nie von Hand editieren.
- Prompts aus „Als Prompt kopieren“ (Pages) enthalten Anker-JSON. Übernimm es unverändert.
- Ist ein Kommentar umgesetzt, markiere ihn mit dem Commit-Hash als erledigt (`/kommentare-abarbeiten`).

## 7. Öffentlich!

Der Playground liegt **öffentlich** auf GitHub Pages (noindex). Deshalb gehören keine vertraulichen Inhalte hinein: keine Kundennamen aus laufenden Akquisen, keine Preise, keine internen Zahlen und keine personenbezogenen Daten außer den Namen, die ohnehin auf der Live-Seite stehen.

## 8. Befehle

| Befehl | Zweck |
| --- | --- |
| `yarn dev` | lokaler Playground mit Live-Reload und Kommentaren auf http://localhost:4360 |
| `yarn build` | statischer Build nach `dist/` |
| `yarn check` | Regeln prüfen (Schema, Isolation, Sperren, Module) |
| `yarn idea new\|status\|page\|override\|module\|comment\|note\|list` | Ideen verwalten (siehe `core/cli/idea.js`) |
| `yarn render-module <modul> ['{json}']` | ein Modul isoliert rendern |
| `yarn sync:theme` / `yarn sync:content` | nur Entwicklung: Theme bzw. Live-Inhalte holen (Branch `sync/…`) |

Skills für alle Abläufe liegen in `.claude/skills/`. Die Hilfeseite `/hilfe/` wird aus ihnen erzeugt. Wenn du einen Skill änderst, änderst du damit auch die Doku.
