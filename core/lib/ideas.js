// Ideen laden, Modul-Overrides auflösen, Dev-Handoff-Diffs berechnen.
import fs from 'node:fs'
import path from 'node:path'
import { createTwoFilesPatch } from 'diff'
import { PATHS, readJson, readText, listDirs, listFiles, walk, exists, hash } from './context.js'

export const ideaDir = slug => path.join(PATHS.ideas, slug)

export function loadIdea(slug) {
  const dir = ideaDir(slug)
  const idea = readJson(path.join(dir, 'idea.json'))
  if (!idea) return null
  const comments = readJson(path.join(dir, 'comments.json'), [])
  return {
    ...idea,
    slug,
    dir,
    readme: readText(path.join(dir, 'README.md')),
    pageFiles: listFiles(path.join(dir, 'pages'), '.html').map(f => f.replace(/\.html$/, '')),
    moduleNames: listDirs(path.join(dir, 'modules')),
    comments,
    openComments: comments.filter(c => !c.resolved).length,
  }
}

export function loadIdeas() {
  return listDirs(PATHS.ideas)
    .map(loadIdea)
    .filter(Boolean)
    .sort((a, b) => String(b.updated).localeCompare(String(a.updated)))
}

export const baselineModules = () => listDirs(PATHS.modules).filter(n => exists(path.join(PATHS.modules, n, 'block.json')))

/** Fingerabdruck eines Baseline-Moduls (für Drift-Erkennung bei Overrides). */
export function moduleFingerprint(name) {
  const dir = path.join(PATHS.modules, name)
  if (!exists(dir)) return null
  const files = walk(dir).filter(f => !f.startsWith('examples/') && f !== 'SOURCE.json' && !f.startsWith('source/')).sort()
  return hash(files.map(f => f + ':' + hash(fs.readFileSync(path.join(dir, f)))).join('|'))
}

/** Map modulName → Verzeichnis, Idee-Overrides gewinnen. */
export function moduleDirMap(idea = null) {
  const map = new Map(baselineModules().map(n => [n, path.join(PATHS.modules, n)]))
  if (idea) for (const n of idea.moduleNames) map.set(n, path.join(idea.dir, 'modules', n))
  return map
}

/** Datei eines Moduls auflösen (Idee → Baseline), z.B. style.scss eines Overrides ohne eigene block.json */
export function resolveModuleFile(idea, name, file) {
  const own = idea && path.join(idea.dir, 'modules', name, file)
  if (own && exists(own)) return own
  const base = path.join(PATHS.modules, name, file)
  return exists(base) ? base : null
}

/** Was eine Idee gegenüber der Baseline ändert – Grundlage der Entwickler-Ansicht. */
export function ideaChanges(idea) {
  const modules = idea.moduleNames.map(name => {
    const baseDir = path.join(PATHS.modules, name)
    const ownDir = path.join(idea.dir, 'modules', name)
    const isOverride = exists(baseDir)
    const files = walk(ownDir).sort()
    const fileChanges = files.map(file => {
      const own = readText(path.join(ownDir, file))
      const base = isOverride ? readText(path.join(baseDir, file), null) : null
      const status = base === null ? 'neu' : base === own ? 'unverändert' : 'geändert'
      const patch = status === 'geändert' ? createTwoFilesPatch(`baseline/${name}/${file}`, `idee/${name}/${file}`, base, own, '', '', { context: 3 }) : null
      return { file, status, patch, content: status === 'neu' ? own : null }
    })
    const baselineNow = isOverride ? moduleFingerprint(name) : null
    const baselineThen = idea.baseline?.[name] ?? null
    const block = readJson(path.join(ownDir, 'block.json')) ?? readJson(path.join(baseDir, 'block.json'), {})
    const baseBlock = isOverride ? readJson(path.join(baseDir, 'block.json'), {}) : {}
    const newAttributes = Object.keys(block.attributes ?? {}).filter(a => !(a in (baseBlock.attributes ?? {})))
    return {
      name,
      kind: isOverride ? 'anpassung' : 'neu',
      files: fileChanges.filter(f => f.status !== 'unverändert'),
      unchanged: fileChanges.filter(f => f.status === 'unverändert').map(f => f.file),
      drift: Boolean(isOverride && baselineThen && baselineNow !== baselineThen),
      newAttributes,
      hasScripts: files.includes('scripts.js'),
    }
  })
  return { modules, drift: modules.some(m => m.drift) }
}
