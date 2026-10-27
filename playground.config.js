// Einzige seitenspezifische Konfiguration des Playgrounds.
// Für eine andere Website: Repo als Template kopieren und nur diese Datei
// (plus theme/, modules/, layout/, pages/ über die Sync-Scripts) anpassen.

export default {
  site: {
    name: '360VIER',
    playgroundTitle: '360VIER Playground',
    liveUrl: 'https://www.360vier.de',
    language: 'de',
    designReference: 'https://www.360vier.de/design.md',
  },

  // Git-Hosting des Playgrounds selbst
  repo: {
    owner: '360vier',
    name: 'dhsv-playground',
    defaultBranch: 'main',
    ideaBranchPrefix: 'idea/',
  },

  // Quelle für `yarn sync:theme`
  theme: {
    // lokaler Checkout (relativ zum Playground) – Fallback: GitHub-Repo via `gh api`
    localPath: '../dhsv012',
    repo: '360vier/dhsv012',
    branch: 'main',
    blockNamespace: 'dhsv',
    blocksDir: 'resources/assets/gutenberg/blocks',
    stylesDir: 'resources/assets/styles',
    stylesEntry: 'main.scss',
    fontsDir: 'resources/assets/fonts',
    svgDir: 'resources/assets/svg',
    themeJson: 'resources/theme.json',
    // Live-Build des Themes (JS wird von dort geladen, siehe docs/architektur.md)
    liveDistUrl: 'https://www.360vier.de/wp-content/themes/360vier-theme/dist/',
    liveScripts: ['runtime.js', 'main.js'],
    // Klassenpräfix, das WordPress für Blocks vergibt (wp-block-<namespace>-<name>)
    blockClassPrefix: 'wp-block-',
  },

  // Quelle für `yarn sync:content`
  content: {
    restBase: 'https://www.360vier.de/wp-json/wp/v2',
    postTypes: ['pages'],
    // Seiten, die nicht in den Playground gehören (Tests, Formular-Landings …)
    excludeSlugs: ['360vier-ai-filter-test', 'testphase', '404-seite', 'kalender-rh', 'kalender-hm'],
    // Seite, aus der Header und Footer übernommen werden
    layoutSourcePath: '/',
    // So viele gerenderte Beispiele werden pro Modul gespeichert
    examplesPerModule: 3,
  },

  // Status-Workflow einer Idee (Reihenfolge = Lebenszyklus)
  statuses: [
    { id: 'entwurf', label: 'Entwurf', color: '#9ca3af' },
    { id: 'in-arbeit', label: 'In Arbeit', color: '#f59e0b' },
    { id: 'review', label: 'Review', color: '#3b82f6' },
    { id: 'freigegeben', label: 'Freigegeben', color: '#81ba49' },
    { id: 'in-umsetzung', label: 'In Umsetzung (Theme)', color: '#8b5cf6' },
    { id: 'umgesetzt', label: 'Umgesetzt', color: '#047857' },
    { id: 'verworfen', label: 'Verworfen', color: '#6b7280' },
  ],

  // Ideen in diesen Status dürfen nicht mehr verändert werden (außer Status/Verlauf)
  lockedStatuses: ['in-umsetzung', 'umgesetzt', 'verworfen'],

  ideaTypes: [
    { id: 'seite', label: 'Neue Seite' },
    { id: 'modul', label: 'Neues Modul' },
    { id: 'anpassung', label: 'Modulanpassung' },
    { id: 'mix', label: 'Gemischt' },
  ],

  // Checkliste für die Übergabe an die Entwicklung (Contracts aus dem Theme-CLAUDE.md)
  handoffChecklist: [
    'Neuer Block mit React Habitat → Block-Name in die Allowlist in app/setup.php (wp_enqueue_scripts, Prio 101)',
    'Block/Plugin braucht jQuery im Frontend → Marker in app/customizations/dequeue-jquery-masonry-chain.php ergänzen',
    'Block besitzt das LCP-Bild → Filter dhsv_block_lcp_image_id registrieren + Klasse dhsv-lcp-image am ersten <img>',
    'scripts.js importiert eine schwere Lib (> ~5 KB gz) → per document.querySelector + dynamic import laden',
    'get_posts() auf übersetzbaren Inhalten → suppress_filters => false (WPML)',
    'Block speichert Link-URL als Attribut → dhsv_wpml_block_link_attributes-Filter registrieren (WPML)',
    'Nur Theme-Tokens (CSS-Variablen aus styles/common) verwenden, keine neuen Hex-Werte',
  ],
}
