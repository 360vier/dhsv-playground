# Architektur

## Bausteine

```
playground.config.js ─┐
                      ▼
theme/ (SCSS, Fonts, SVG) ──► core/lib/styles.js ──► assets/theme.css + assets/blocks/wp-block-*.css
modules/<name>/  ─────┐                               (gleiche Regeln wie resources/assets/build/util/blockStyles.js)
ideas/<slug>/modules ─┤
                      ▼
ideas/<slug>/pages/*.html ──► core/renderer/blocks.js ──► core/renderer/document.njk ──► dist/ideen/<slug>/<seite>/
(Gutenberg-Block-Grammar)     (Parser von @wordpress,      (Header/Footer/Core-Styles/
                               Nunjucks-Templates)           Theme-JS aus layout/, Overlay)
pages/live/*.html ───────────────────────────────────────────────────────────────────► dist/live/<slug>/
```

- **Seiten** sind Gutenberg-Block-Grammar, also dasselbe Format wie `post_content`. Blocks im Namespace der Config (`dhsv/*`) rendert `modules/<name>/template.njk`, alle anderen Blocks werden mit ihrem gespeicherten HTML durchgereicht.
- **Modulauflösung:** Zuerst greift `ideas/<slug>/modules/<name>/`, danach `modules/<name>/`. Das gilt auch für jede einzelne SCSS-Datei. Ändert eine Idee eine `styles.scss` (globales Bundle), wird für die Idee ein eigenes `theme.css` gebaut.
- **Module ohne `template.njk`** werden über ihr erstes Live-Beispiel (`examples/`) dargestellt. So ist jede Seite sofort vollständig, auch bevor alle Blade-Views übersetzt sind.
- **Theme-JS** (`runtime.js`, `main.js`, `lazyload.js`) ist ein Snapshot der Live-Seite in `layout/assets/`. `runtime.js` bekommt einen absoluten `publicPath`, damit Lazy-Chunks (Splide, Lottie …) von 360vier.de geladen werden. **Einschränkung:** Eine geänderte `scripts.js` in einer Idee wird nicht ausgeführt. Verhalten wird im README beschrieben oder als Prototyp für die Entwicklung abgelegt.
- **Kommentare:** `core/overlay/overlay.js` (Shadow DOM). Der Anker besteht aus Modul, n-tem Vorkommen, CSS-Pfad, Prozent-Offset und Textauszug. Geschrieben wird nur über den Dev-Server (`/__api/comments`) oder `yarn idea comment`.

## Git-Fluss und CI

| Workflow | Auslöser | Tut |
| --- | --- | --- |
| `idea.yml` | Push auf `idea/**` | `yarn check` (Isolation), Build, PR nach `main` erstellen und mergen (Merge-Commit, Branch bleibt), danach Pages-Deploy |
| `pr.yml` | PR auf `main` (z. B. `core/…`, `sync/…`) | `yarn check` + Build |
| `deploy.yml` | Push auf `main`, manuell, oder aufgerufen von `idea.yml` | Build mit `PG_BASE=/<repo>/` und Deploy auf GitHub Pages |
| `sync-live.yml` | wöchentlich und manuell | `sync:theme` + `sync:content`, PR `sync/live-<datum>` mit Label `core` |

Secrets und Variablen:
- `THEME_REPO_TOKEN`: Lesezugriff auf das Theme-Repo (fine-grained PAT, nur `contents:read`) für `sync:theme` in CI
- `WP_APP_USER` und `WP_APP_PASSWORD`: optional, Application Password eines Read-only-Users für Block-Grammar (`context=edit`)

Einstellungen im Repo (einmalig durch einen Admin):
- Settings → Pages → Source: **GitHub Actions**
- Settings → Actions → General → Workflow permissions: **Read and write** + „Allow GitHub Actions to create and approve pull requests“
- Branch-Protection für `main`: PR erforderlich, Status-Check `check` erforderlich, kein Force-Push. Damit der Auto-Merge funktioniert, darf `github-actions` die Regel umgehen; alternativ kein Approval verlangen.
- Label `core` anlegen.

## Für eine andere Website duplizieren

1. Repo als Template verwenden („Use this template“, das Repo ist als Template markiert).
2. In `playground.config.js` anpassen: `site`, `repo`, `theme` (Pfade, Namespace, Live-Dist-URL), `content` (REST-Basis, Ausschlüsse), `handoffChecklist`.
3. Leeren: `theme/`, `modules/`, `layout/`, `pages/live/`, `ideas/`.
4. `yarn sync:theme && yarn sync:content` ausführen und danach `/module-sync` für die wichtigsten Module.
5. In `CLAUDE.md` die seitenspezifischen Stellen anpassen (Design-Referenz, Tokens-Pfad).

Voraussetzungen für das Theme: Sage/Gutenberg-Blocks mit `block.json` je Ordner und SCSS mit `style.scss`/`styles.scss`. Bei abweichenden Build-Regeln wird `core/lib/styles.js` angepasst. Generisch, ohne Anpassung pro Website, sind: `core/`, `.claude/skills/` (lesen Namen und Pfade aus der Config) und `.github/workflows/`.

Später möglich: `core/` als Paket `@360vier/playground-core` auslagern, sobald es eine zweite Website nutzt.
