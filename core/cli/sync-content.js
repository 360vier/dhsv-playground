// yarn sync:content – Inhalte und Layout von der Live-Seite holen.
//
// Schreibt:
//   pages/live/index.json            Metadaten aller Seiten
//   pages/live/<slug>.html           gerenderter Inhalt von <main> (Live-HTML, read-only Referenz)
//   pages/live/<slug>.blocks.html    Block-Grammar (post_content) – nur mit WP_APP_USER/WP_APP_PASSWORD
//   layout/header.html, footer.html  Header/Footer der Live-Seite
//   layout/head.html                 WordPress-Core-Styles (Inline) + Body-Klassen
//   layout/scripts.html              Theme-JS (runtime mit absolutem publicPath, main.js, lazyload.js)
//   modules/<name>/examples/*.html   gerenderte Instanzen je Modul
import fs from 'node:fs'
import path from 'node:path'
import { PATHS, loadConfig, writeFile, writeJson, readJson, hash } from '../lib/context.js'
import { findElement, innerOf, findAllByClass, attr } from '../lib/html.js'

const config = await loadConfig()
const { content: c, site, theme } = config
const auth =
  process.env.WP_APP_USER && process.env.WP_APP_PASSWORD
    ? 'Basic ' + Buffer.from(`${process.env.WP_APP_USER}:${process.env.WP_APP_PASSWORD}`).toString('base64')
    : null

const UA = { 'User-Agent': 'dhsv-playground-sync (+https://github.com/' + config.repo.owner + '/' + config.repo.name + ')' }

async function get(url, { json = false, headers = {} } = {}) {
  const res = await fetch(url, { headers: { ...UA, ...headers } })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return json ? { data: await res.json(), res } : res.text()
}

async function listItems(type, extra = '') {
  const items = []
  for (let page = 1; ; page++) {
    const { data, res } = await get(
      `${c.restBase}/${type}?per_page=100&page=${page}&_fields=id,slug,link,title,parent,modified${extra}`,
      { json: true, headers: auth && extra ? { Authorization: auth } : {} }
    )
    items.push(...data)
    if (page >= Number(res.headers.get('x-wp-totalpages') || 1)) break
  }
  return items
}

// ── Seiten ────────────────────────────────────────────────────────────────
const pages = []
for (const type of c.postTypes) {
  for (const item of await listItems(type)) {
    if (c.excludeSlugs.includes(item.slug)) continue
    pages.push({
      type,
      id: item.id,
      slug: item.slug,
      title: item.title?.rendered ?? item.slug,
      link: item.link,
      path: new URL(item.link).pathname,
      modified: item.modified,
    })
  }
}

let raw = {}
if (auth) {
  for (const type of c.postTypes) {
    try {
      for (const item of await listItems(type, ',content&context=edit')) raw[item.id] = item.content?.raw
    } catch (e) {
      console.warn(`! Block-Grammar nicht verfügbar (${e.message}) – nur gerendertes HTML`)
      raw = {}
    }
  }
} else {
  console.log('ℹ Ohne WP_APP_USER/WP_APP_PASSWORD wird nur gerendertes HTML geholt (keine Block-Grammar).')
}

fs.rmSync(PATHS.pagesLive, { recursive: true, force: true })
fs.rmSync(path.join(PATHS.layout, 'assets'), { recursive: true, force: true })
const examples = new Map() // modul → [{page, html}]
// WordPress-Core-/Global-Styles (Inline, je Seite andere Core-Blocks) – das Theme-CSS kompilieren wir selbst
const coreStyleRe = /<style[^>]*id=["'](wp-[^"']+|global-styles[^"']*|core-block-supports[^"']*|classic-theme-styles[^"']*)["'][^>]*>[\s\S]*?<\/style>/g
const coreStyles = new Map()
// Plugin-Stylesheets (z.B. KI-Chat) werden von der Live-Seite verlinkt, Theme-CSS nicht (kompilieren wir selbst)
const pluginLinkRe = /<link[^>]*rel=["']stylesheet["'][^>]*href=["'][^"']*\/wp-content\/plugins\/[^"']*["'][^>]*>/g
const collectCoreStyles = html => {
  const head = html.slice(0, html.indexOf('</head>'))
  for (const m of head.matchAll(coreStyleRe)) if (!coreStyles.has(m[1])) coreStyles.set(m[1], m[0])
  for (const m of head.matchAll(pluginLinkRe)) {
    const id = attr(m[0], 'id') ?? m[0]
    if (!coreStyles.has(id)) coreStyles.set(id, m[0])
  }
}
const blockPrefix = `${theme.blockClassPrefix}${theme.blockNamespace}-`

for (const p of pages) {
  let html
  try {
    html = await get(p.link)
  } catch (e) {
    console.warn(`! ${p.slug}: ${e.message}`)
    continue
  }
  const main = findElement(html, /<main\b[^>]*id=["']main["'][^>]*>/)
  if (!main) {
    console.warn(`! ${p.slug}: kein <main id="main">`)
    continue
  }
  let body = innerOf(main).trim()
  // .is-root-container kommt aus layout/app – hier nur den Inhalt speichern
  const root = findElement(body, /<div class="is-root-container">/)
  if (root) body = innerOf(root).trim()
  collectCoreStyles(html)
  p.bodyClass = /<body[^>]*class="([^"]*)"/.exec(html)?.[1] ?? ''
  p.hasBlocks = Boolean(raw[p.id])
  writeFile(path.join(PATHS.pagesLive, `${p.slug}.html`), body + '\n')
  if (raw[p.id]) writeFile(path.join(PATHS.pagesLive, `${p.slug}.blocks.html`), raw[p.id] + '\n')

  for (const m of body.matchAll(new RegExp(`class="[^"]*\\b${blockPrefix}([a-z0-9-]+)\\b`, 'g'))) {
    const name = m[1]
    if (!examples.has(name)) examples.set(name, new Map())
  }
  for (const name of examples.keys()) {
    const bucket = examples.get(name)
    if (bucket.size >= c.examplesPerModule) continue
    for (const el of findAllByClass(body, `${blockPrefix}${name}`)) {
      const key = hash(el)
      if (bucket.size < c.examplesPerModule && ![...bucket.values()].some(v => v.key === key)) bucket.set(`${p.slug}-${bucket.size + 1}`, { key, html: el, page: p.slug })
    }
  }
  process.stdout.write('.')
}
process.stdout.write('\n')
writeJson(path.join(PATHS.pagesLive, 'index.json'), { syncedAt: new Date().toISOString(), source: site.liveUrl, pages })

// Beispiele je Modul (nur für Module, die es im Playground gibt)
for (const [name, bucket] of examples) {
  const dir = path.join(PATHS.modules, name)
  if (!fs.existsSync(dir)) continue
  fs.rmSync(path.join(dir, 'examples'), { recursive: true, force: true })
  for (const [id, ex] of bucket) writeFile(path.join(dir, 'examples', `${id}.html`), `<!-- Quelle: ${site.liveUrl}${pages.find(x => x.slug === ex.page)?.path} -->\n${ex.html}\n`)
}

// ── Layout (Header, Footer, Core-Styles, Theme-JS) ───────────────────────
const layoutHtml = await get(site.liveUrl + c.layoutSourcePath)
const header = findElement(layoutHtml, /<header\b[^>]*>/)
const footer = findElement(layoutHtml, /<footer\b[^>]*>/)
collectCoreStyles(layoutHtml)
writeFile(path.join(PATHS.layout, 'header.html'), header + '\n')
writeFile(path.join(PATHS.layout, 'footer.html'), footer + '\n')
writeFile(path.join(PATHS.layout, 'head.html'), [...coreStyles.values()].join('\n') + '\n')

// Theme-JS als Snapshot (runtime/main/lazyload passen so immer zusammen).
// runtime.js bekommt einen absoluten publicPath, damit Lazy-Chunks von der Live-Seite laden.
const scriptTags = [...layoutHtml.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/g)].map(m => m[0])
const keepIds = /^(sage\/|wp-hooks|wp-i18n)/
const scripts = []
for (const tag of scriptTags) {
  const id = attr(tag, 'id') ?? ''
  if (!keepIds.test(id)) continue
  const src = attr(tag, 'src')
  if (src && id.startsWith('sage/')) {
    const file = new URL(src).pathname.split('/').pop()
    let js = await get(src)
    if (file === 'runtime.js') js = js.replace(/(\.p=)"\/[^"]*"/, `$1"${theme.liveDistUrl}"`)
    writeFile(path.join(PATHS.layout, 'assets', file), js)
    const defer = /\sdefer\b/.test(tag) ? ' defer' : ''
    scripts.push(`<script id="${id}"${defer} src="{{ base }}layout/${file}?v=${hash(js)}"></script>`)
  } else {
    scripts.push(tag)
  }
}
writeFile(path.join(PATHS.layout, 'scripts.html'), scripts.join('\n') + '\n')
writeJson(path.join(PATHS.layout, 'SOURCE.json'), {
  source: site.liveUrl + c.layoutSourcePath,
  bodyClass: /<body[^>]*class="([^"]*)"/.exec(layoutHtml)?.[1] ?? '',
  syncedAt: new Date().toISOString(),
})

const prev = readJson(path.join(PATHS.cache, 'sync-content-prev.json'), {})
console.log(`✓ ${pages.length} Seiten, ${examples.size} Module mit Beispielen, Layout aktualisiert`)
writeJson(path.join(PATHS.cache, 'sync-content-prev.json'), { ...prev, last: new Date().toISOString() })
