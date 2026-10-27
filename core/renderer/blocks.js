// Block-Renderer: Gutenberg-Block-Grammar (wie post_content) → HTML.
//
// - `<ns>/*`-Blocks werden über modules/<name>/template.njk gerendert (Idee-Override vor Baseline)
// - alle anderen Blocks (core/*, Freeform-HTML) werden mit ihrem gespeicherten HTML durchgereicht
// - jeder Modul-Wrapper bekommt `data-pg-block` + `data-pg-id` (Anker für Kommentare)
import fs from 'node:fs'
import path from 'node:path'
import nunjucks from 'nunjucks'
import { parse } from '@wordpress/block-serialization-default-parser'
import { PATHS, readJson, escapeHtml, exists } from '../lib/context.js'

const svgCache = new Map()
function svg(name, attrs = {}) {
  // Blade: @svg('icons.arrow-right') → theme/svg/icons/arrow-right.svg
  const file = path.join(PATHS.theme, 'svg', ...name.split('.')) + '.svg'
  if (!svgCache.has(file)) svgCache.set(file, exists(file) ? fs.readFileSync(file, 'utf8').trim() : `<!-- svg ${name} fehlt -->`)
  // blade-svg setzt standardmäßig class="dhsv-icon" (config/blade-svg)
  const cls = [...new Set(['dhsv-icon', ...String(attrs.class ?? '').split(/\s+/)].filter(Boolean))].join(' ')
  const out = svgCache.get(file).replace(/<svg\b/, `<svg class="${escapeHtml(cls)}"`)
  return new nunjucks.runtime.SafeString(out)
}

/**
 * @param {object} opts
 * @param {object} opts.config      playground.config.js
 * @param {string|null} opts.ideaDir   Verzeichnis der Idee (Overrides) oder null für Baseline
 */
export function createBlockRenderer({ config, ideaDir = null }) {
  const ns = config.theme.blockNamespace
  const prefix = config.theme.blockClassPrefix
  const searchPaths = [ideaDir && path.join(ideaDir, 'modules'), PATHS.modules].filter(p => p && exists(p))
  const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(searchPaths, { noCache: true }), {
    autoescape: true,
    throwOnUndefined: false,
    trimBlocks: true,
    lstripBlocks: true,
  })
  env.addGlobal('svg', svg)
  env.addGlobal('__', s => s) // i18n: Playground ist einsprachig (Quelle DE)
  env.addFilter('json', v => new nunjucks.runtime.SafeString(escapeHtml(JSON.stringify(v))))
  env.addFilter('trim_tags', s => String(s ?? '').replace(/<[^>]*>/g, ''))

  const usedModules = new Set()
  let idCounter = 0

  const moduleDir = name => {
    for (const base of searchPaths) if (exists(path.join(base, name, 'block.json'))) return path.join(base, name)
    return null
  }

  function defaults(dir) {
    const attrs = readJson(path.join(dir, 'block.json'), {}).attributes ?? {}
    return Object.fromEntries(Object.entries(attrs).filter(([, d]) => 'default' in d).map(([k, d]) => [k, structuredClone(d.default)]))
  }

  function renderModule(block, name, innerHtml) {
    const dir = moduleDir(name)
    usedModules.add(name)
    const pgId = `pg-${++idCounter}`
    const blockClass = `${prefix}${ns}-${name}`
    if (!dir) return placeholder(block, `Modul „${name}“ existiert nicht`, blockClass, pgId)

    const attributes = { ...defaults(dir), ...block.attrs }
    // entspricht get_block_wrapper_attributes(['class' => …]) in WordPress
    const wrapper = (extraClass = '', extraAttrs = {}) => {
      const classes = [blockClass, attributes.align && attributes.align !== 'none' ? `align${attributes.align}` : '', attributes.className, extraClass]
        .filter(Boolean)
        .join(' ')
      const rest = Object.entries(extraAttrs)
        .map(([k, v]) => ` ${k}="${escapeHtml(v)}"`)
        .join('')
      const anchor = attributes.anchor ? ` id="${escapeHtml(attributes.anchor)}"` : ''
      return new nunjucks.runtime.SafeString(`class="${escapeHtml(classes)}"${anchor} data-pg-block="${ns}/${name}" data-pg-id="${pgId}"${rest}`)
    }

    if (!exists(path.join(dir, 'template.njk'))) {
      const exDir = path.join(PATHS.modules, name, 'examples')
      const example = exists(exDir) && fs.readdirSync(exDir).sort()[0]
      if (example) {
        const html = fs.readFileSync(path.join(exDir, example), 'utf8').replace(/^<!--.*?-->\n/, '')
        return html.replace(new RegExp(`class="([^"]*\\b${blockClass}\\b)`), `data-pg-block="${ns}/${name}" data-pg-id="${pgId}" data-pg-example="1" class="$1`)
      }
      return placeholder(block, `Modul „${name}“ hat noch kein template.njk`, blockClass, pgId)
    }

    try {
      const html = env.render(`${name}/template.njk`, {
        ...attributes,
        attributes,
        content: new nunjucks.runtime.SafeString(innerHtml),
        block: { name: `${ns}/${name}`, innerBlocks: block.innerBlocks },
        wrapper,
      })
      // Blocks ohne get_block_wrapper_attributes (z.B. button, icon-box) trotzdem kommentierbar machen
      if (html.includes(`data-pg-id="${pgId}"`)) return html
      return html.replace(/<([a-zA-Z][a-zA-Z0-9-]*)(?=[\s>])/, `<$1 data-pg-block="${ns}/${name}" data-pg-id="${pgId}"`)
    } catch (e) {
      return placeholder(block, `Fehler in ${name}/template.njk: ${e.message}`, blockClass, pgId)
    }
  }

  function placeholder(block, message, blockClass, pgId) {
    return `<div class="${blockClass} pg-placeholder" data-pg-id="${pgId}" style="padding:2rem;margin:2rem auto;max-width:var(--content-size,70rem);border:2px dashed #f59e0b;background:#fffbeb;color:#92400e;font:14px/1.4 system-ui">
  <strong>${escapeHtml(block.blockName)}</strong> – ${escapeHtml(message)}
</div>`
  }

  function renderBlock(block) {
    const inner = block.innerBlocks.map(renderBlock)
    let i = 0
    const innerHtml = block.innerContent.map(part => (part === null ? inner[i++] ?? '' : part)).join('')
    if (!block.blockName) return block.innerHTML
    const [blockNs, name] = block.blockName.split('/')
    if (blockNs === ns && name) return renderModule(block, name, innerHtml)
    return innerHtml
  }

  return {
    render(source) {
      return parse(source).map(renderBlock).join('')
    },
    usedModules,
    moduleDir,
  }
}
