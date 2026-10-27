// yarn idea <befehl> … – alles rund um Ideen. Wird von den Skills genutzt, geht aber auch von Hand.
//
//   yarn idea new "<Titel>" [--type seite|modul|anpassung|mix] [--slug x] [--summary "…"] [--no-branch]
//   yarn idea status <slug> <status> [--note "…"] [--pr <url>] [--ticket <url>]
//   yarn idea page <slug> <name> [--from-live <live-slug>] [--title "…"]
//   yarn idea override <slug> <modul>          Baseline-Modul in die Idee kopieren (Anpassung)
//   yarn idea module <slug> <modul>            Neues Modul aus dem Boilerplate anlegen
//   yarn idea comment <slug> <json>            Kommentar-Aktion (add|reply|resolve) – für Prompts von Pages
//   yarn idea note <slug> "<Notiz>"            Eintrag im Verlauf
//   yarn idea list
import fs from 'node:fs'
import path from 'node:path'
import { PATHS, loadConfig, readJson, writeJson, writeFile, readText, exists, copyDir, currentUser, today, slugify, sh } from '../lib/context.js'
import { loadIdeas, moduleFingerprint, baselineModules } from '../lib/ideas.js'
import { applyCommentAction } from '../lib/comments.js'

const config = await loadConfig()
const [cmd, ...rest] = process.argv.slice(2)
const flags = {}
const args = []
for (let i = 0; i < rest.length; i++) {
  if (rest[i].startsWith('--')) {
    const key = rest[i].slice(2)
    flags[key] = rest[i + 1] && !rest[i + 1].startsWith('--') ? rest[++i] : true
  } else args.push(rest[i])
}
const user = currentUser()
const die = msg => {
  console.error('✗ ' + msg)
  process.exit(1)
}

const ideaPath = slug => path.join(PATHS.ideas, slug)
function loadIdeaJson(slug) {
  const idea = readJson(path.join(ideaPath(slug), 'idea.json'))
  if (!idea) die(`Idee „${slug}“ gibt es nicht. Vorhandene: ${loadIdeas().map(i => i.slug).join(', ') || '–'}`)
  return idea
}
function saveIdea(slug, idea, note, status) {
  idea.updated = today()
  if (!idea.contributors.includes(user) && idea.author !== user) idea.contributors.push(user)
  if (note || status) idea.history.push({ date: today(), user, ...(status ? { status } : {}), note: note ?? '' })
  writeJson(path.join(ideaPath(slug), 'idea.json'), idea)
}
function assertEditable(idea) {
  if (config.lockedStatuses.includes(idea.status) && !flags.force) die(`Idee hat Status „${idea.status}“ und ist gesperrt. Neue Idee anlegen oder Status zurücksetzen (Absprache!).`)
}

switch (cmd) {
  case 'new': {
    const title = args[0] || die('Titel fehlt: yarn idea new "Mein Titel"')
    const slug = flags.slug || slugify(title)
    if (exists(ideaPath(slug))) die(`Idee „${slug}“ existiert schon`)
    const type = flags.type || 'mix'
    if (!config.ideaTypes.some(t => t.id === type)) die(`Typ muss einer von ${config.ideaTypes.map(t => t.id).join(', ')} sein`)
    const branch = config.repo.ideaBranchPrefix + slug
    if (!flags['no-branch']) {
      const dirty = sh('git status --porcelain')
      if (dirty) die('Arbeitskopie hat uncommittete Änderungen – erst committen oder stashen.')
      sh(`git fetch origin ${config.repo.defaultBranch}`)
      const hasRemote = sh(`git rev-parse --verify origin/${config.repo.defaultBranch}`)
      sh(`git switch -c ${branch} ${hasRemote ? 'origin/' + config.repo.defaultBranch : config.repo.defaultBranch}`)
      if (sh('git rev-parse --abbrev-ref HEAD') !== branch) die(`Branch ${branch} konnte nicht angelegt werden`)
    }
    const theme = readJson(path.join(PATHS.theme, 'SOURCE.json'), {})
    const idea = {
      $schema: '../../core/schemas/idea.schema.json',
      slug,
      title,
      summary: flags.summary || '',
      type,
      status: 'entwurf',
      author: user,
      contributors: [],
      created: today(),
      updated: today(),
      tags: [],
      pages: {},
      baseline: {},
      themeSha: theme.sha ?? null,
      theme: { ticket: flags.ticket || null, pr: null },
      history: [{ date: today(), user, status: 'entwurf', note: 'Idee angelegt' }],
    }
    writeJson(path.join(ideaPath(slug), 'idea.json'), idea)
    writeJson(path.join(ideaPath(slug), 'comments.json'), [])
    const tpl = readText(path.join(PATHS.core, 'templates', 'idea-README.md'))
    writeFile(path.join(ideaPath(slug), 'README.md'), tpl.replaceAll('{{title}}', title).replaceAll('{{summary}}', flags.summary || '…'))
    fs.mkdirSync(path.join(ideaPath(slug), 'pages'), { recursive: true })
    fs.mkdirSync(path.join(ideaPath(slug), 'assets'), { recursive: true })
    writeFile(path.join(ideaPath(slug), 'assets', '.gitkeep'), '')
    console.log(`✓ Idee angelegt: ideas/${slug}/${flags['no-branch'] ? '' : `  (Branch ${branch})`}`)
    break
  }

  case 'status': {
    const [slug, status] = args
    const idea = loadIdeaJson(slug)
    if (!config.statuses.some(s => s.id === status)) die(`Status muss einer von ${config.statuses.map(s => s.id).join(', ')} sein`)
    idea.status = status
    if (flags.pr) idea.theme.pr = flags.pr
    if (flags.ticket) idea.theme.ticket = flags.ticket
    saveIdea(slug, idea, flags.note || '', status)
    console.log(`✓ ${slug} → ${status}`)
    break
  }

  case 'note': {
    const [slug, note] = args
    const idea = loadIdeaJson(slug)
    saveIdea(slug, idea, note || die('Notiz fehlt'))
    console.log('✓ Verlauf ergänzt')
    break
  }

  case 'page': {
    const [slug, rawName] = args
    const idea = loadIdeaJson(slug)
    assertEditable(idea)
    const name = slugify(rawName || die('Seitenname fehlt'))
    const file = path.join(ideaPath(slug), 'pages', `${name}.html`)
    if (exists(file)) die(`Seite ${name} existiert schon`)
    let source = '<!-- wp:paragraph -->\n<p>Neue Seite – Inhalt mit Claude aufbauen.</p>\n<!-- /wp:paragraph -->\n'
    const meta = { title: flags.title || rawName }
    if (flags['from-live']) {
      const live = flags['from-live']
      const blocks = path.join(PATHS.pagesLive, `${live}.blocks.html`)
      const html = path.join(PATHS.pagesLive, `${live}.html`)
      if (exists(blocks)) source = readText(blocks)
      else if (exists(html))
        source = `<!-- pg: Kopie des gerenderten Live-HTML von „${live}“ (keine Block-Grammar verfügbar). Abschnitte, die geändert werden, als wp:${config.theme.blockNamespace}/…-Blocks neu aufbauen. -->\n` + readText(html)
      else die(`Live-Seite ${live} nicht gefunden (yarn sync:content?)`)
      meta.basedOn = live
    }
    writeFile(file, source)
    idea.pages[name] = meta
    saveIdea(slug, idea, `Seite „${meta.title}“ angelegt${meta.basedOn ? ` (Basis: ${meta.basedOn})` : ''}`)
    console.log(`✓ ideas/${slug}/pages/${name}.html`)
    break
  }

  case 'override': {
    const [slug, mod] = args
    const idea = loadIdeaJson(slug)
    assertEditable(idea)
    if (!baselineModules().includes(mod)) die(`Baseline-Modul „${mod}“ gibt es nicht`)
    const target = path.join(ideaPath(slug), 'modules', mod)
    if (exists(target)) die(`Override für ${mod} existiert schon`)
    copyDir(path.join(PATHS.modules, mod), target, rel => !rel.startsWith('examples/') && !rel.startsWith('source/') && rel !== 'SOURCE.json')
    idea.baseline[mod] = moduleFingerprint(mod)
    if (idea.type === 'seite') idea.type = 'mix'
    saveIdea(slug, idea, `Modul ${mod} zur Anpassung kopiert`)
    console.log(`✓ ideas/${slug}/modules/${mod}/ (Baseline ${idea.baseline[mod]})`)
    break
  }

  case 'module': {
    const [slug, raw] = args
    const idea = loadIdeaJson(slug)
    assertEditable(idea)
    const mod = slugify(raw || die('Modulname fehlt'))
    if (baselineModules().includes(mod)) die(`„${mod}“ gibt es schon als Baseline – dafür „override“ nutzen`)
    const target = path.join(ideaPath(slug), 'modules', mod)
    if (exists(target)) die(`Modul ${mod} existiert schon in der Idee`)
    const ns = config.theme.blockNamespace
    const boiler = path.join(PATHS.core, 'templates', 'module')
    for (const f of fs.readdirSync(boiler)) {
      writeFile(path.join(target, f), readText(path.join(boiler, f)).replaceAll('__NS__', ns).replaceAll('__NAME__', mod).replaceAll('__TITLE__', flags.title || raw))
    }
    saveIdea(slug, idea, `Neues Modul ${ns}/${mod} angelegt`)
    console.log(`✓ ideas/${slug}/modules/${mod}/`)
    break
  }

  case 'comment': {
    const [slug, json] = args
    loadIdeaJson(slug)
    const action = JSON.parse(json || die('JSON fehlt'))
    const all = applyCommentAction(slug, action, flags.as || user)
    console.log(`✓ Kommentar-Aktion ${action.action} – ${all.filter(c => !c.resolved).length} offen`)
    break
  }

  case 'list': {
    for (const i of loadIdeas()) console.log(`${i.status.padEnd(13)} ${i.slug.padEnd(36)} ${i.author.padEnd(16)} ${i.title}`)
    break
  }

  default:
    console.log(readText(new URL(import.meta.url).pathname).split('\n').slice(1, 11).map(l => l.replace(/^\/\/ ?/, '')).join('\n'))
}
