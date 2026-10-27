# dhsv-playground

Versionierter HTML-Playground für **360vier.de**. Designer, Geschäftsführung und Entwicklung bauen hier mit Claude neue Seiten, neue Module und Modulanpassungen. Jede Idee ist isoliert, hat Autor und Status und lässt sich 1:1 ins WordPress-Theme ([`360vier/dhsv012`](https://github.com/360vier/dhsv012)) übernehmen.

- **Online:** https://360vier.github.io/dhsv-playground/ (öffentlich, noindex)
- **Hilfe:** [`/hilfe/`](https://360vier.github.io/dhsv-playground/hilfe/), erzeugt aus [`.claude/skills/`](.claude/skills/)
- **Regeln für Claude:** [`CLAUDE.md`](CLAUDE.md)
- **Architektur und Wiederverwendung für andere Websites:** [`docs/architektur.md`](docs/architektur.md)

```bash
yarn install
yarn dev        # http://localhost:4360 – Live-Reload, Kommentare schreibbar
```

## Ablauf in Kürze

```
/idee-neu  →  Branch idea/<slug> + ideas/<slug>/
   ↓  /seite-bauen, /modul-anpassen, /modul-neu, Kommentare (Taste C)
git push   →  CI: yarn check → Auto-Merge nach main → GitHub Pages
   ↓  /idee-status review → freigegeben
/idee-uebergeben  →  Entwicklung setzt im Theme um (Status: in-umsetzung, gesperrt)
/idee-abschliessen →  Status umgesetzt, Theme-PR verlinkt, Branch gelöscht
```

## Verzeichnisse

| Pfad | Inhalt | Wer ändert |
| --- | --- | --- |
| `ideas/<slug>/` | eine Idee: `idea.json`, `README.md`, `pages/`, `modules/`, `assets/`, `comments.json` | Idee-Branch |
| `modules/<name>/` | Baseline-Module = Theme-Blocks (`block.json`, SCSS, `template.njk`, `source/`, `examples/`) | `yarn sync:theme` + `/module-sync` |
| `theme/` | Snapshot von Styles, Fonts und Icons des Themes | `yarn sync:theme` |
| `pages/live/` | gerenderte Live-Seiten | `yarn sync:content` |
| `layout/` | Header, Footer, Core-Styles, Theme-JS der Live-Seite | `yarn sync:content` |
| `core/` | Renderer, Overlay, App, CLI (generisch) | Branch `core/…` + Review |
| `playground.config.js` | einzige seitenspezifische Konfiguration | Branch `core/…` |
