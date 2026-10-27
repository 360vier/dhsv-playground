// yarn render-module <modul> ['{"attr":"wert"}'] [--idea <slug>] [--inner '<!-- wp:… -->']
// Rendert ein Modul isoliert (Standard: example.attributes aus block.json) – zum Prüfen von template.njk
// gegen die Live-Beispiele in modules/<modul>/examples/.
import path from 'node:path'
import { PATHS, loadConfig, readJson } from '../lib/context.js'
import { createBlockRenderer } from '../renderer/blocks.js'

const config = await loadConfig()
const args = process.argv.slice(2)
const flag = name => (args.includes(name) ? args.splice(args.indexOf(name), 2)[1] : null)
const ideaSlug = flag('--idea')
const inner = flag('--inner') ?? ''
const [name, json] = args
if (!name) {
  console.error('Aufruf: yarn render-module <modul> [attributes-json] [--idea slug] [--inner block-markup]')
  process.exit(1)
}
const ideaDir = ideaSlug ? path.join(PATHS.ideas, ideaSlug) : null
const block = readJson(path.join(ideaDir ? path.join(ideaDir, 'modules') : PATHS.modules, name, 'block.json')) ?? readJson(path.join(PATHS.modules, name, 'block.json'), {})
const attrs = json ? JSON.parse(json) : block.example?.attributes ?? {}
const ns = config.theme.blockNamespace
const source = inner ? `<!-- wp:${ns}/${name} ${JSON.stringify(attrs)} -->${inner}<!-- /wp:${ns}/${name} -->` : `<!-- wp:${ns}/${name} ${JSON.stringify(attrs)} /-->`
const html = createBlockRenderer({ config, ideaDir }).render(source)
console.log(html)
if (/pg-placeholder/.test(html)) process.exit(2)
