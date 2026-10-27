// SCSS-Pipeline – bildet die Theme-Build-Regeln nach (resources/assets/build/util/blockStyles.js):
//  - theme/styles/main.scss + alle Block-`styles.scss` (+ slider.scss) → ein globales Bundle (wie main.css)
//  - Block-`style.scss` → eigene Datei, per postcss-prefixwrap auf `.wp-block-<ns>-<name>` gescopt
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import * as sass from 'sass'
import postcss from 'postcss'
import prefixwrap from 'postcss-prefixwrap'
import { PATHS, exists } from './context.js'

// `~paket/...` (webpack-Syntax) → node_modules
const tildeImporter = {
  findFileUrl(url) {
    if (!url.startsWith('~')) return null
    return new URL(pathToFileURL(path.join(PATHS.root, 'node_modules', url.slice(1))))
  },
}

function compile(entryOrSource, { fromFile = true, loadPaths = [] } = {}) {
  const opts = {
    style: 'expanded',
    importers: [tildeImporter],
    loadPaths: [path.join(PATHS.root, 'node_modules'), ...loadPaths],
    quietDeps: true,
    silenceDeprecations: ['import', 'global-builtin', 'legacy-js-api', 'mixed-decls', 'color-functions', 'slash-div'],
    logger: sass.Logger.silent,
  }
  return fromFile
    ? sass.compile(entryOrSource, opts).css
    : sass.compileString(entryOrSource, { ...opts, url: pathToFileURL(path.join(PATHS.theme, 'styles', '_inline.scss')) }).css
}

// Font-/Asset-URLs aus theme/styles/common/_fonts.scss auf den Playground umbiegen.
// `@import '~paket/x.css'` lässt Sass als CSS-Import stehen – webpack hat es inline aufgelöst, wir auch.
const rewriteUrls = (css, assetBase) =>
  css
    .replace(/@import\s+(?:url\()?["']~([^"']+\.css)["']\)?\s*;/g, (m, p) => {
      const file = path.join(PATHS.root, 'node_modules', p)
      return exists(file) ? fs.readFileSync(file, 'utf8') : m
    })
    .replace(/url\((['"]?)(?:\.\.\/)+fonts\//g, `url($1${assetBase}fonts/`)

/**
 * Globales Bundle. `moduleDirs` = Map name → Verzeichnis (Baseline oder Idee-Override),
 * damit eine Idee die `styles.scss` eines Moduls ersetzen kann.
 */
export function compileThemeBundle(moduleDirs, { assetBase }) {
  const imports = [`@import 'main';`]
  for (const [, dir] of [...moduleDirs.entries()].sort()) {
    for (const file of ['styles.scss', 'slider.scss']) {
      const p = path.join(dir, file)
      if (exists(p)) imports.push(`@import '${p.replace(/\\/g, '/')}';`)
    }
  }
  const css = compile(imports.join('\n'), { fromFile: false, loadPaths: [path.join(PATHS.theme, 'styles')] })
  return rewriteUrls(css, assetBase)
}

/** Gescopte Einzel-CSS eines Blocks mit `style.scss` (null, wenn es keine gibt). */
export async function compileBlockStyle(dir, blockName, { assetBase, prefix = 'wp-block-' }) {
  const file = path.join(dir, 'style.scss')
  if (!exists(file)) return null
  const className = prefix + blockName.replace('/', '-')
  const css = compile(file, { loadPaths: [path.join(PATHS.theme, 'styles')] })
  const result = await postcss([prefixwrap(`.${className}`, { ignoredSelectors: [new RegExp(`^\\.${className}`)] })]).process(css, {
    from: undefined,
  })
  return rewriteUrls(result.css, assetBase)
}

export const blockStyleFileName = blockName => `wp-block-${blockName.replace('/', '-')}-style.css`
