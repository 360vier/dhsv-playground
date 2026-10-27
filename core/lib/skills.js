// Skills aus .claude/skills/<name>/SKILL.md lesen – Quelle für die Hilfeseite.
// Konvention: Frontmatter (name, description, audience: alle|dev) + Abschnitt "## Für Menschen".
import path from 'node:path'
import { PATHS, listDirs, readText } from './context.js'

export function parseFrontmatter(text) {
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(text)
  if (!m) return { data: {}, body: text }
  const data = {}
  for (const line of m[1].split('\n')) {
    const kv = /^([a-zA-Z_-]+):\s*(.*)$/.exec(line)
    if (kv) data[kv[1]] = kv[2].replace(/^["']|["']$/g, '')
  }
  return { data, body: text.slice(m[0].length) }
}

export function loadSkills() {
  return listDirs(PATHS.skills)
    .map(dir => {
      const text = readText(path.join(PATHS.skills, dir, 'SKILL.md'))
      if (!text) return null
      const { data, body } = parseFrontmatter(text)
      const human = /## Für Menschen\n([\s\S]*?)(?=\n## |$)/.exec(body)?.[1]?.trim() ?? ''
      return { name: data.name ?? dir, description: data.description ?? '', audience: data.audience ?? 'alle', order: Number(data.order ?? 50), human }
    })
    .filter(Boolean)
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
}
