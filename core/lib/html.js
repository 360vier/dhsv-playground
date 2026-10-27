// Minimaler HTML-Ausschnitt-Helfer (ohne DOM-Bibliothek) für die Live-Snapshots.

/** Findet das Element, das bei `startIndex` mit `<tag` beginnt, und liefert outerHTML inkl. verschachtelter gleicher Tags. */
export function sliceElement(html, startIndex) {
  const tag = /^<([a-zA-Z0-9-]+)/.exec(html.slice(startIndex))?.[1]
  if (!tag) return null
  const re = new RegExp(`<${tag}(?=[\\s>/])|</${tag}\\s*>`, 'gi')
  re.lastIndex = startIndex
  let depth = 0
  let m
  while ((m = re.exec(html))) {
    if (m[0][1] === '/') depth--
    else depth++
    if (depth === 0) return html.slice(startIndex, m.index + m[0].length)
  }
  return null
}

/** Erstes Element, dessen öffnender Tag auf `openTagRegex` passt. */
export function findElement(html, openTagRegex) {
  const m = openTagRegex.exec(html)
  return m ? sliceElement(html, m.index) : null
}

export const innerOf = outer => outer.replace(/^<[^>]*>/, '').replace(/<\/[a-zA-Z0-9-]+\s*>$/, '')

/** Alle äußersten Elemente, deren class-Attribut `className` als ganzes Wort enthält. */
export function findAllByClass(html, className) {
  const re = new RegExp(`<([a-zA-Z0-9-]+)\\s[^>]*class=(["'])(?:[^"']*\\s)?${className}(?:\\s[^"']*)?\\2[^>]*>`, 'g')
  const out = []
  let m
  let cursor = 0
  while ((m = re.exec(html))) {
    if (m.index < cursor) continue // verschachtelt in einem bereits gefundenen Element
    const el = sliceElement(html, m.index)
    if (!el) continue
    out.push(el)
    cursor = m.index + el.length
  }
  return out
}

export const attr = (tag, name) => new RegExp(`\\s${name}=(["'])(.*?)\\1`).exec(tag)?.[2] ?? null
