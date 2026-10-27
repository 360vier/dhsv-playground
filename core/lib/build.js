// Statischer Build des Playgrounds nach dist/.
import fs from 'node:fs'
import path from 'node:path'
import nunjucks from 'nunjucks'
import { marked } from 'marked'
import { PATHS, loadConfig, readJson, readText, writeFile, copyDir, exists, listDirs, escapeHtml, hash } from './context.js'
import { compileThemeBundle, compileBlockStyle, blockStyleFileName } from './styles.js'
import { loadIdeas, moduleDirMap, ideaChanges, baselineModules } from './ideas.js'
import { createBlockRenderer } from '../renderer/blocks.js'
import { loadSkills } from './skills.js'

const cssCache = new Map() // Dev-Server: SCSS nur neu kompilieren, wenn sich Eingaben geändert haben

function scssKey(dirs) {
  const files = [path.join(PATHS.theme, 'styles'), ...dirs].flatMap(d =>
    exists(d) ? fs.readdirSync(d, { recursive: true }).filter(f => String(f).endsWith('.scss')).map(f => path.join(d, String(f))) : []
  )
  return hash(files.sort().map(f => f + fs.statSync(f).mtimeMs).join('|'))
}

export async function build({ base = '/', dev = false, only = null } = {}) {
  const t0 = Date.now()
  const config = await loadConfig()
  const out = PATHS.dist
  const assetBase = `${base}assets/`
  const repoUrl = `https://github.com/${config.repo.owner}/${config.repo.name}`
  const themeSource = readJson(path.join(PATHS.theme, 'SOURCE.json'), { sha: 'ohne Sync' })
  const liveIndex = readJson(path.join(PATHS.pagesLive, 'index.json'), { pages: [], syncedAt: '' })
  const layoutSource = readJson(path.join(PATHS.layout, 'SOURCE.json'), { bodyClass: '' })
  const statusById = Object.fromEntries(config.statuses.map(s => [s.id, s]))

  if (!only) fs.rmSync(out, { recursive: true, force: true })
  fs.mkdirSync(out, { recursive: true })

  // ── statische Assets ────────────────────────────────────────────────────
  copyDir(path.join(PATHS.theme, 'fonts'), path.join(out, 'assets', 'fonts'))
  copyDir(path.join(PATHS.layout, 'assets'), path.join(out, 'layout'))
  for (const f of ['app.css', 'app.js']) fs.copyFileSync(path.join(PATHS.core, 'app', f), path.join(out, 'assets', f))
  fs.copyFileSync(path.join(PATHS.core, 'overlay', 'overlay.js'), path.join(out, 'assets', 'pg-overlay.js'))
  writeFile(path.join(out, 'robots.txt'), 'User-agent: *\nDisallow: /\n')
  writeFile(path.join(out, '.nojekyll'), '')

  // ── Templates ───────────────────────────────────────────────────────────
  const appEnv = new nunjucks.Environment(new nunjucks.FileSystemLoader([path.join(PATHS.core, 'app'), path.join(PATHS.core, 'renderer')], { noCache: true }), {
    autoescape: true,
  })
  const statusBadge = id => {
    const s = statusById[id] ?? { label: id, color: '#999' }
    return `<span class="pg-status" style="--c:${s.color}">${escapeHtml(s.label)}</span>`
  }
  const typeLabel = id => config.ideaTypes.find(x => x.id === id)?.label ?? id
  appEnv.addFilter('diffHtml', patch =>
    patch
      .split('\n')
      .slice(2)
      .map(l => `<span class="${l.startsWith('+') ? 'add' : l.startsWith('-') ? 'del' : l.startsWith('@@') ? 'hunk' : ''}">${escapeHtml(l)}</span>`)
      .join('\n')
  )
  const shared = { config, base, repoUrl, themeSource, liveSyncedAt: liveIndex.syncedAt, statusBadge, typeLabel }
  const renderApp = (tpl, file, data) => writeFile(path.join(out, file), appEnv.render(tpl, { ...shared, ...data }))

  const layout = {
    head: readText(path.join(PATHS.layout, 'head.html')),
    header: readText(path.join(PATHS.layout, 'header.html')),
    footer: readText(path.join(PATHS.layout, 'footer.html')),
    scripts: readText(path.join(PATHS.layout, 'scripts.html')).replaceAll('{{ base }}', base),
  }
  const livePathMap = new Map(liveIndex.pages.map(p => [p.path, `${base}live/${p.slug}/`]))
  // Links auf Live-Seiten innerhalb des Playgrounds halten (Header-Navigation, Teaser …)
  const liveHost = new URL(config.site.liveUrl).host.replace(/^www\./, '').replace(/\./g, '\\.')
  const rewriteLinks = html =>
    html.replace(new RegExp(`href="https?://(?:www\\.)?${liveHost}(/[^"#?]*)"`, 'g'), (m, p) => (livePathMap.has(p) ? `href="${livePathMap.get(p)}"` : m))
  const layoutFor = () => ({ ...layout, header: rewriteLinks(layout.header), footer: rewriteLinks(layout.footer) })

  // ── CSS: Baseline ───────────────────────────────────────────────────────
  const blockFiles = new Map() // name → Dateiname der gescopten Block-CSS
  async function compileModuleStyles(dirMap, targetDir, onlyNames = null) {
    const result = new Map()
    for (const [name, dir] of dirMap) {
      if (onlyNames && !onlyNames.includes(name)) continue
      const block = readJson(path.join(dir, 'block.json')) ?? readJson(path.join(PATHS.modules, name, 'block.json'), {})
      if (!block.name || !exists(path.join(dir, 'style.scss'))) continue
      const key = 'block:' + dir + scssKey([dir])
      let css = dev ? cssCache.get(key) : null
      if (css == null) {
        try {
          css = await compileBlockStyle(dir, block.name, { assetBase, prefix: config.theme.blockClassPrefix })
        } catch (e) {
          css = `/* SCSS-Fehler in ${name}/style.scss: ${e.message.replace(/\*\//g, '')} */`
          console.error(`✗ ${path.relative(PATHS.root, dir)}/style.scss: ${e.message.split('\n')[0]}`)
        }
        cssCache.set(key, css)
      }
      const file = blockStyleFileName(block.name)
      writeFile(path.join(targetDir, file), css)
      result.set(name, file)
    }
    return result
  }
  function compileBundle(dirMap, file) {
    const key = 'bundle:' + scssKey([...dirMap.values()])
    let css = dev ? cssCache.get(key) : null
    if (css == null) {
      try {
        css = compileThemeBundle(dirMap, { assetBase })
      } catch (e) {
        css = `/* SCSS-Fehler: ${e.message.replace(/\*\//g, '')} */`
        console.error(`✗ Theme-Bundle: ${e.message.split('\n').slice(0, 3).join(' ')}`)
      }
      cssCache.set(key, css)
    }
    writeFile(file, css)
  }

  const baseDirs = moduleDirMap(null)
  compileBundle(baseDirs, path.join(out, 'assets', 'theme.css'))
  for (const [n, f] of await compileModuleStyles(baseDirs, path.join(out, 'assets', 'blocks'))) blockFiles.set(n, f)

  const usedBlockCss = (html, own = new Map(), ownBase = '') => {
    const prefix = `${config.theme.blockClassPrefix}${config.theme.blockNamespace}-`
    const names = new Set([...html.matchAll(new RegExp(`\\b${prefix}([a-z0-9-]+)\\b`, 'g'))].map(m => m[1]))
    return [...names].flatMap(n => (own.has(n) ? [`${ownBase}${own.get(n)}`] : blockFiles.has(n) ? [`${assetBase}blocks/${blockFiles.get(n)}`] : []))
  }

  const renderDocument = ({ file, title, content, bodyClass, themeCss, blockCss, pg }) =>
    writeFile(
      path.join(out, file),
      appEnv.render('document.njk', {
        ...shared,
        title,
        content,
        bodyClass: bodyClass || layoutSource.bodyClass,
        themeCss: themeCss ?? `${assetBase}theme.css`,
        blockCss,
        layout: layoutFor(),
        withThemeJs: true,
        pg: { base, repoUrl, writable: dev, branchPrefix: config.repo.ideaBranchPrefix, ...pg },
      })
    )

  // ── Live-Seiten ─────────────────────────────────────────────────────────
  if (!only || only === 'live') {
    for (const p of liveIndex.pages) {
      const content = rewriteLinks(readText(path.join(PATHS.pagesLive, `${p.slug}.html`)))
      renderDocument({
        file: `live/${p.slug}/index.html`,
        title: `Live: ${p.title}`,
        content,
        bodyClass: p.bodyClass,
        blockCss: usedBlockCss(content),
        pg: { mode: 'live', page: p.slug, title: p.title, liveUrl: p.link, hasBlocks: p.hasBlocks },
      })
    }
    renderApp('live.njk', 'live/index.html', { nav: 'live', title: 'Live-Seiten', pages: liveIndex.pages })
  }

  // ── Ideen ───────────────────────────────────────────────────────────────
  const ideas = loadIdeas().map(i => ({ ...i, changes: ideaChanges(i), allPeople: [i.author, ...(i.contributors ?? [])] }))
  for (const idea of ideas) {
    if (only && only !== 'ideas' && only !== `idea:${idea.slug}`) continue
    const ideaOut = `ideen/${idea.slug}`
    const ideaBase = `${base}${ideaOut}/`
    const dirMap = moduleDirMap(idea)
    const overrides = idea.moduleNames.filter(n => baselineModules().includes(n))
    const bundleChanged = idea.moduleNames.some(n => ['styles.scss', 'slider.scss'].some(f => exists(path.join(idea.dir, 'modules', n, f))))
    let themeCss = `${assetBase}theme.css`
    if (bundleChanged) {
      compileBundle(dirMap, path.join(out, ideaOut, 'theme.css'))
      themeCss = `${ideaBase}theme.css`
    }
    const ownBlockCss = await compileModuleStyles(dirMap, path.join(out, ideaOut, 'blocks'), idea.moduleNames)
    copyDir(path.join(idea.dir, 'assets'), path.join(out, ideaOut, 'assets'))
    const fixAssets = html => html.replace(/(src|href|srcset|poster)="(?:\.\/)?assets\//g, `$1="${ideaBase}assets/`).replace(/url\((['"]?)(?:\.\/)?assets\//g, `url($1${ideaBase}assets/`)

    const pages = idea.pageFiles.map(name => {
      const meta = idea.pages?.[name] ?? {}
      const source = readText(path.join(idea.dir, 'pages', `${name}.html`))
      const comments = idea.comments.filter(c => c.page === name && !c.resolved).length
      return { name, title: meta.title ?? name, basedOn: meta.basedOn ?? null, bodyClass: meta.bodyClass ?? '', source, comments }
    })

    for (const p of pages) {
      const variants = [{ suffix: '', ideaDir: idea.dir, css: themeCss, own: ownBlockCss, label: 'nachher' }]
      if (overrides.length) variants.push({ suffix: 'vorher/', ideaDir: null, css: `${assetBase}theme.css`, own: new Map(), label: 'vorher' })
      for (const v of variants) {
        const renderer = createBlockRenderer({ config, ideaDir: v.ideaDir })
        const content = rewriteLinks(fixAssets(renderer.render(p.source)))
        const bodyClass = p.bodyClass || (p.basedOn && liveIndex.pages.find(x => x.slug === p.basedOn)?.bodyClass) || ''
        renderDocument({
          file: `${ideaOut}/${p.name}/${v.suffix}index.html`,
          title: `${idea.title} – ${p.title}`,
          content,
          bodyClass,
          themeCss: v.css,
          blockCss: usedBlockCss(content, v.own, `${ideaBase}blocks/`),
          pg: {
            mode: 'idea',
            variant: v.label,
            hasBefore: overrides.length > 0,
            idea: { slug: idea.slug, title: idea.title, status: idea.status, statusLabel: statusById[idea.status]?.label, author: idea.author },
            page: p.name,
            pages: pages.map(x => ({ name: x.name, title: x.title })),
            comments: idea.comments.filter(c => c.page === p.name),
            locked: config.lockedStatuses.includes(idea.status),
          },
        })
      }
    }

    renderApp('idea.njk', `${ideaOut}/index.html`, {
      nav: 'ideen',
      title: idea.title,
      idea,
      pages,
      changes: idea.changes,
      hasOverrides: overrides.length > 0,
      readmeHtml: marked.parse(idea.readme.replace(/^# .*\n/, '')),
    })
  }

  if (!only) {
    // ── Modulbibliothek ─────────────────────────────────────────────────
    const modules = baselineModules().map(name => {
      const dir = path.join(PATHS.modules, name)
      const block = readJson(path.join(dir, 'block.json'), {})
      const source = readJson(path.join(dir, 'SOURCE.json'), {})
      const hasTemplate = exists(path.join(dir, 'template.njk'))
      const examples = exists(path.join(dir, 'examples')) ? fs.readdirSync(path.join(dir, 'examples')).sort() : []
      return {
        name,
        dir,
        block,
        title: block.title ?? name,
        blockName: block.name,
        template: !hasTemplate ? 'fehlt' : source.templateTranslatedFrom && source.templateTranslatedFrom !== source.viewHash ? 'veraltet' : 'ok',
        styles: ['style.scss', 'styles.scss', 'slider.scss'].filter(f => exists(path.join(dir, f))),
        scripts: exists(path.join(dir, 'scripts.js')),
        examples: examples.length,
        exampleFiles: examples,
        ideas: ideas.filter(i => i.moduleNames.includes(name)).map(i => i.slug),
      }
    })
    renderApp('modules.njk', 'module/index.html', { nav: 'module', title: 'Module', modules })
    for (const m of modules) {
      const parts = []
      if (m.template !== 'fehlt' && m.block.example?.attributes) {
        const renderer = createBlockRenderer({ config })
        const demo = `<!-- wp:${m.blockName} ${JSON.stringify(m.block.example.attributes)} /-->`
        parts.push(sectionLabel('Template mit Beispiel-Attributen aus block.json'), renderer.render(demo))
      }
      for (const ex of m.exampleFiles) {
        const html = readText(path.join(m.dir, 'examples', ex))
        const src = /<!-- Quelle: (.*?) -->/.exec(html)?.[1] ?? ''
        parts.push(sectionLabel(`Live-Beispiel: ${src}`), html.replace(/^<!--.*?-->\n/, ''))
      }
      if (!parts.length) parts.push(sectionLabel('Kein Beispiel vorhanden – Modul wird auf der Live-Seite aktuell nicht genutzt.'))
      const content = rewriteLinks(parts.join('\n'))
      renderDocument({
        file: `module/${m.name}/index.html`,
        title: `Modul ${m.title}`,
        content,
        blockCss: usedBlockCss(content),
        pg: { mode: 'module', module: m.name, blockName: m.blockName, template: m.template },
      })
    }

    // ── Hilfe (aus Skills generiert) ────────────────────────────────────
    const skills = loadSkills()
    renderApp('help.njk', 'hilfe/index.html', {
      nav: 'hilfe',
      title: 'Hilfe',
      skills: skills.map(s => ({ ...s, humanHtml: marked.parse(s.human) })),
      introHtml: marked.parse(readText(path.join(PATHS.root, 'docs', 'hilfe.md'))),
    })

    // ── Übersicht ───────────────────────────────────────────────────────
    const authors = [...new Set(ideas.flatMap(i => i.allPeople))].sort()
    renderApp('index.njk', 'index.html', { nav: 'ideen', ideas, authors })
    writeFile(
      path.join(out, 'ideas.json'),
      JSON.stringify(
        ideas.map(({ dir, readme, comments, changes, ...rest }) => ({ ...rest, drift: changes.drift })),
        null,
        2
      )
    )
  }

  const ms = Date.now() - t0
  return { ms, ideas: ideas.length, live: liveIndex.pages.length }
}

const sectionLabel = text =>
  `<div class="pg-section-label" style="max-width:var(--wide-size,85rem);margin:3rem auto 1rem;padding:.5rem 1rem;font:600 12px/1.4 system-ui;letter-spacing:.04em;text-transform:uppercase;color:#6b7280;border-top:1px dashed #d1d5db">${escapeHtml(text)}</div>`
