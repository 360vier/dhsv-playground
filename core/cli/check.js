// yarn check [--base origin/main] – Regeln durchsetzen (lokal vor dem Push und in CI).
//
//  1. idea.json gegen Schema + Config (Status, Typ, Slug = Ordnername)
//  2. Seiten parsen, verwendete Module existieren
//  3. Isolation: auf einem idea/<slug>-Branch dürfen nur Dateien in ideas/<slug>/ geändert werden
//     (Ausnahme: PG_ALLOW_CORE=1, gesetzt für Branches core/* und sync/* bzw. PR-Label `core`)
//  4. Gesperrte Ideen (Status in lockedStatuses) – nur idea.json/comments.json dürfen sich ändern
//  5. Warnungen: feste Hex-Farben in Idee-SCSS (Theme-Tokens nutzen!)
import path from 'node:path'
import Ajv from 'ajv'
import { parse } from '@wordpress/block-serialization-default-parser'
import { PATHS, loadConfig, readJson, readText, listDirs, walk, exists, sh } from '../lib/context.js'
import { baselineModules } from '../lib/ideas.js'

const config = await loadConfig()
const errors = []
const warnings = []
const err = (where, msg) => errors.push(`${where}: ${msg}`)
const warn = (where, msg) => warnings.push(`${where}: ${msg}`)

const argBase = process.argv.indexOf('--base')
const baseRef = argBase > -1 ? process.argv[argBase + 1] : `origin/${config.repo.defaultBranch}`

// ── 1 + 2: Ideen ─────────────────────────────────────────────────────────
const ajv = new Ajv({ allErrors: true })
const validate = ajv.compile(readJson(path.join(PATHS.core, 'schemas', 'idea.schema.json')))
const baseline = new Set(baselineModules())
const ns = config.theme.blockNamespace

for (const slug of listDirs(PATHS.ideas)) {
  const where = `ideas/${slug}`
  const dir = path.join(PATHS.ideas, slug)
  const idea = readJson(path.join(dir, 'idea.json'))
  if (!idea) {
    err(where, 'idea.json fehlt')
    continue
  }
  if (!validate(idea)) for (const e of validate.errors) err(`${where}/idea.json`, `${e.instancePath || '/'} ${e.message}`)
  if (idea.slug !== slug) err(where, `slug „${idea.slug}“ ≠ Ordnername`)
  if (!config.statuses.some(s => s.id === idea.status)) err(where, `unbekannter Status „${idea.status}“`)
  if (!config.ideaTypes.some(t => t.id === idea.type)) err(where, `unbekannter Typ „${idea.type}“`)
  if (!exists(path.join(dir, 'README.md'))) err(where, 'README.md fehlt')
  const comments = readJson(path.join(dir, 'comments.json'), [])
  if (!Array.isArray(comments)) err(where, 'comments.json muss ein Array sein')

  const ideaModules = new Set(listDirs(path.join(dir, 'modules')))
  for (const mod of ideaModules) {
    if (!baseline.has(mod) && !exists(path.join(dir, 'modules', mod, 'block.json'))) err(`${where}/modules/${mod}`, 'neues Modul braucht block.json')
    if (baseline.has(mod) && !(mod in (idea.baseline ?? {}))) warn(`${where}/modules/${mod}`, 'Override ohne Baseline-Fingerprint – mit `yarn idea override` anlegen')
    const bj = readJson(path.join(dir, 'modules', mod, 'block.json'))
    if (bj && bj.name !== `${ns}/${mod}`) err(`${where}/modules/${mod}/block.json`, `name muss „${ns}/${mod}“ sein`)
  }

  for (const file of walk(path.join(dir, 'pages'))) {
    if (!file.endsWith('.html')) continue
    const name = file.replace(/\.html$/, '')
    let blocks
    try {
      blocks = parse(readText(path.join(dir, 'pages', file)))
    } catch (e) {
      err(`${where}/pages/${file}`, `nicht parsebar: ${e.message}`)
      continue
    }
    const visit = list =>
      list.forEach(b => {
        const [bns, mod] = (b.blockName ?? '').split('/')
        if (bns === ns && !ideaModules.has(mod) && !baseline.has(mod)) err(`${where}/pages/${file}`, `Modul ${ns}/${mod} existiert nicht`)
        if (bns === ns && !exists(path.join(dir, 'modules', mod, 'template.njk')) && !exists(path.join(PATHS.modules, mod, 'template.njk')))
          warn(`${where}/pages/${file}`, `${ns}/${mod} hat kein template.njk – Attribute werden ignoriert, Live-Beispiel wird gezeigt`)
        visit(b.innerBlocks)
      })
    visit(blocks)
    if (!idea.pages?.[name]) warn(where, `Seite ${name} hat keinen Eintrag in idea.json → pages (Titel)`)
  }
  for (const name of Object.keys(idea.pages ?? {})) if (!exists(path.join(dir, 'pages', `${name}.html`))) err(where, `pages.${name} in idea.json, aber pages/${name}.html fehlt`)

  for (const file of walk(path.join(dir, 'modules')).filter(f => f.endsWith('.scss'))) {
    const scss = readText(path.join(dir, 'modules', file))
    const baseScss = readText(path.join(PATHS.modules, file)) // Override: nur neu hinzugekommene Farben melden
    const hex = [...new Set(scss.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [])].filter(h => !baseScss.includes(h))
    if (hex.length) warn(`${where}/modules/${file}`, `feste Farben ${hex.join(', ')} – Theme-Tokens (var(--…)) verwenden`)
  }
}

// ── 3 + 4: Isolation ─────────────────────────────────────────────────────
const branch = process.env.GITHUB_HEAD_REF || process.env.PG_BRANCH || sh('git rev-parse --abbrev-ref HEAD')
const allowCore = process.env.PG_ALLOW_CORE === '1' || /^(core|sync)\//.test(branch)
if (branch.startsWith(config.repo.ideaBranchPrefix)) {
  const slug = branch.slice(config.repo.ideaBranchPrefix.length)
  const mergeBase = sh(`git merge-base ${baseRef} HEAD`)
  if (!mergeBase) {
    warn('git', `Basis ${baseRef} nicht gefunden – Isolation nicht geprüft (git fetch origin?)`)
  } else {
    const changed = sh(`git diff --name-only ${mergeBase}`).split('\n').concat(sh('git ls-files --others --exclude-standard').split('\n')).filter(Boolean)
    if (!exists(path.join(PATHS.ideas, slug, 'idea.json'))) err('branch', `Branch ${branch} gehört zu keiner Idee (ideas/${slug}/ fehlt)`)
    const outside = changed.filter(f => !f.startsWith(`ideas/${slug}/`))
    if (outside.length && !allowCore)
      err('isolation', `Branch ${branch} darf nur ideas/${slug}/ ändern. Außerhalb geändert:\n    ${outside.join('\n    ')}\n  → Änderungen an Core/Modulen/Theme gehören in einen Branch core/… mit Review.`)
    const before = JSON.parse(sh(`git show ${mergeBase}:ideas/${slug}/idea.json`) || 'null')
    if (before && config.lockedStatuses.includes(before.status)) {
      const content = changed.filter(f => f.startsWith(`ideas/${slug}/`) && !/\/(idea|comments)\.json$/.test(f))
      if (content.length) err('gesperrt', `Idee war bereits „${before.status}“ – Inhalte dürfen nicht mehr geändert werden:\n    ${content.join('\n    ')}`)
    }
  }
} else if (branch === config.repo.defaultBranch && !process.env.CI) {
  warn('branch', `Du arbeitest direkt auf ${branch}. Ideen gehören auf ${config.repo.ideaBranchPrefix}<slug>.`)
}

// ── Ausgabe ──────────────────────────────────────────────────────────────
for (const w of warnings) console.log(`⚠ ${w}`)
for (const e of errors) console.log(`✗ ${e}`)
if (errors.length) {
  console.log(`\n${errors.length} Fehler – bitte beheben.`)
  process.exit(1)
}
console.log(`✓ Check bestanden (${listDirs(PATHS.ideas).length} Ideen, ${warnings.length} Warnungen)`)
