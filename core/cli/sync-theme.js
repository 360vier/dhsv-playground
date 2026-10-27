// yarn sync:theme – Vendor-Snapshot des WordPress-Themes in den Playground holen.
//
// Schreibt: theme/ (styles, fonts, svg, theme.json, SOURCE.json)
//           modules/<block>/ (block.json, *.scss, scripts.js, source/*.blade.php|index.php, SOURCE.json)
// Lässt unangetastet: modules/<block>/template.njk, README.md, examples/
//
// Danach meldet es Module, deren Blade-View sich seit der letzten Übersetzung
// geändert hat (→ Skill /module-sync) und Theme-Blocks ohne template.njk.
import fs from 'node:fs'
import path from 'node:path'
import { PATHS, loadConfig, copyDir, readJson, writeJson, hashFile, sh, listDirs, exists } from '../lib/context.js'

const config = await loadConfig()
const t = config.theme

function resolveSource() {
  const local = path.resolve(PATHS.root, t.localPath)
  if (exists(path.join(local, t.blocksDir))) {
    if (process.argv.includes('--pull')) sh(`git -C "${local}" pull --ff-only`)
    return { dir: local, sha: sh(`git -C "${local}" rev-parse HEAD`), ref: sh(`git -C "${local}" rev-parse --abbrev-ref HEAD`) }
  }
  // Fallback (CI / Cloud-Session): flacher Clone in .cache
  const dir = path.join(PATHS.cache, 'theme-src')
  fs.rmSync(dir, { recursive: true, force: true })
  fs.mkdirSync(PATHS.cache, { recursive: true })
  const url = process.env.THEME_REPO_TOKEN
    ? `https://x-access-token:${process.env.THEME_REPO_TOKEN}@github.com/${t.repo}.git`
    : `git@github.com:${t.repo}.git`
  sh(`git clone --depth 1 --branch ${t.branch} ${url} "${dir}"`, { stdio: 'inherit' })
  if (!exists(path.join(dir, t.blocksDir))) {
    console.error(`✗ Theme-Quelle nicht gefunden (weder ${local} noch ${t.repo}).`)
    process.exit(1)
  }
  return { dir, sha: sh(`git -C "${dir}" rev-parse HEAD`), ref: t.branch }
}

const src = resolveSource()
console.log(`→ Theme-Quelle: ${src.dir} @ ${src.sha.slice(0, 8)} (${src.ref})`)
if (src.ref !== t.branch) console.warn(`⚠ Theme-Checkout steht auf „${src.ref}“, nicht auf „${t.branch}“ – Snapshot enthält evtl. unveröffentlichte Änderungen.`)

// 1) Globale Theme-Dateien
for (const sub of ['styles', 'fonts', 'svg']) fs.rmSync(path.join(PATHS.theme, sub), { recursive: true, force: true })
copyDir(path.join(src.dir, t.stylesDir), path.join(PATHS.theme, 'styles'), rel => rel.endsWith('.scss') && !rel.startsWith('backend/'))
copyDir(path.join(src.dir, t.fontsDir), path.join(PATHS.theme, 'fonts'), rel => /\.(woff2?|ttf|otf|eot)$/.test(rel))
copyDir(path.join(src.dir, t.svgDir), path.join(PATHS.theme, 'svg'), rel => rel.endsWith('.svg') || rel === 'registry.json')
if (exists(path.join(src.dir, t.themeJson))) fs.copyFileSync(path.join(src.dir, t.themeJson), path.join(PATHS.theme, 'theme.json'))

writeJson(path.join(PATHS.theme, 'SOURCE.json'), {
  repo: t.repo,
  ref: src.ref,
  sha: src.sha,
  syncedAt: new Date().toISOString(),
})

// 2) Module (= Gutenberg-Blocks des Themes)
const blocksDir = path.join(src.dir, t.blocksDir)
const themeBlocks = listDirs(blocksDir).filter(name => exists(path.join(blocksDir, name, 'block.json')))
const report = { neu: [], aktualisiert: [], ohneTemplate: [], templateVeraltet: [], entfernt: [] }

for (const name of themeBlocks) {
  const from = path.join(blocksDir, name)
  const to = path.join(PATHS.modules, name)
  const isNew = !exists(to)
  const prev = readJson(path.join(to, 'SOURCE.json'), {})

  // Laufzeit-relevante Dateien 1:1 (gleiche Dateinamen wie im Theme)
  for (const file of fs.readdirSync(from)) {
    const full = path.join(from, file)
    if (!fs.statSync(full).isFile()) continue
    if (file === 'block.json' || file.endsWith('.scss') && file !== 'editor.scss' || file === 'scripts.js') {
      fs.mkdirSync(to, { recursive: true })
      fs.copyFileSync(full, path.join(to, file))
    }
  }
  // Server-Rendering als Referenz für die Übersetzung nach template.njk
  fs.rmSync(path.join(to, 'source'), { recursive: true, force: true })
  for (const file of fs.readdirSync(from)) {
    if (file.endsWith('.blade.php') || file === 'index.php') {
      fs.mkdirSync(path.join(to, 'source'), { recursive: true })
      fs.copyFileSync(path.join(from, file), path.join(to, 'source', file))
    }
  }

  const viewHash = hashFile(path.join(from, 'index.blade.php'))
  const files = Object.fromEntries(
    fs.readdirSync(to).filter(f => f !== 'SOURCE.json' && fs.statSync(path.join(to, f)).isFile()).map(f => [f, hashFile(path.join(to, f))])
  )
  const source = {
    block: readJson(path.join(from, 'block.json')).name,
    themeSha: src.sha,
    viewHash,
    // wird vom Skill /module-sync gesetzt, sobald template.njk zur View passt
    templateTranslatedFrom: prev.templateTranslatedFrom ?? null,
    files,
  }
  writeJson(path.join(to, 'SOURCE.json'), source)

  const changed = JSON.stringify(prev.files) !== JSON.stringify(files) || prev.viewHash !== viewHash
  if (isNew) report.neu.push(name)
  else if (changed) report.aktualisiert.push(name)
  if (!exists(path.join(to, 'template.njk'))) report.ohneTemplate.push(name)
  else if (source.templateTranslatedFrom && source.templateTranslatedFrom !== viewHash) report.templateVeraltet.push(name)
}

for (const name of listDirs(PATHS.modules)) {
  if (!themeBlocks.includes(name)) report.entfernt.push(name)
}

console.log(`✓ ${themeBlocks.length} Module synchronisiert`)
const line = (label, list) => list.length && console.log(`  ${label} (${list.length}): ${list.join(', ')}`)
line('neu', report.neu)
line('geändert', report.aktualisiert)
line('ohne template.njk → /module-sync', report.ohneTemplate)
line('template.njk veraltet → /module-sync', report.templateVeraltet)
line('nicht mehr im Theme (manuell prüfen)', report.entfernt)
writeJson(path.join(PATHS.cache, 'sync-theme-report.json'), report)
