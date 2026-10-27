/* Playground-Overlay: Toolbar + Figma-artige Kommentar-Pins.
 * Läuft in jeder gerenderten Seite (Ideen, Live, Module), isoliert per Shadow DOM.
 * Lokal (Dev-Server, __PG__.writable) werden Kommentare über /__api/comments in
 * ideas/<slug>/comments.json gespeichert; auf GitHub Pages sind sie read-only und
 * lassen sich als Prompt für Claude kopieren. */
;(function () {
  const PG = window.__PG__ || {}
  const base = PG.base || '/'
  const writable = Boolean(PG.writable && PG.mode === 'idea')
  let comments = PG.comments || []
  let commentMode = false
  let showResolved = false
  let openId = null
  let me = null

  // ── DOM ──────────────────────────────────────────────────────────────────
  const host = document.createElement('pg-overlay')
  host.style.cssText = 'position:absolute;top:0;left:0;width:0;height:0;z-index:2147483000'
  document.body.appendChild(host)
  const root = host.attachShadow({ mode: 'open' })
  root.innerHTML = `<style>
    :host { all: initial; }
    * { box-sizing: border-box; font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; }
    .bar { position: fixed; left: 50%; bottom: 16px; transform: translateX(-50%); display: flex; align-items: center; gap: 4px; padding: 6px; max-width: calc(100vw - 32px); overflow-x: auto;
      background: #1d1d1b; color: #f2f2f0; border-radius: 14px; box-shadow: 0 10px 30px rgba(0,0,0,.35); font-size: 13px; scrollbar-width: none; }
    .bar.min > :not(.toggle) { display: none; }
    .bar a, .bar button, .bar select { all: unset; cursor: pointer; padding: 7px 10px; border-radius: 9px; white-space: nowrap; color: inherit; font-size: 13px; line-height: 1; }
    .bar a:hover, .bar button:hover, .bar select:hover { background: rgba(255,255,255,.1); }
    .bar .on { background: #81ba49; color: #10210a; }
    .bar .sep { width: 1px; align-self: stretch; background: rgba(255,255,255,.15); margin: 2px 2px; }
    .bar .label { padding: 7px 8px; opacity: .85; max-width: 22ch; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .status { display: inline-block; padding: 3px 7px; border-radius: 99px; background: rgba(129,186,73,.25); font-size: 11px; font-weight: 700; margin-left: 4px; }
    .bar select option { color: #111; }
    .pins { position: absolute; top: 0; left: 0; }
    .pin { position: absolute; width: 28px; height: 28px; margin: -28px 0 0 0; border-radius: 14px 14px 14px 2px; background: #81ba49; color: #10210a; border: 2px solid #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,.35); font: 700 12px/24px system-ui; text-align: center; cursor: pointer; }
    .pin.resolved { background: #9ca3af; opacity: .7; }
    .pin.lost { background: #f59e0b; }
    .pin.active { outline: 3px solid #1d1d1b; }
    .hl { position: absolute; pointer-events: none; outline: 2px solid #81ba49; background: rgba(129,186,73,.08); border-radius: 2px; transition: all .05s; }
    .pop { position: absolute; width: 320px; max-width: calc(100vw - 24px); background: #fff; color: #1d1d1b; border-radius: 12px; box-shadow: 0 12px 40px rgba(0,0,0,.3); padding: 12px; font-size: 13px; line-height: 1.45; }
    .pop h4 { margin: 0 0 6px; font-size: 12px; color: #6b7280; font-weight: 600; }
    .pop .msg { margin: 0 0 8px; white-space: pre-wrap; }
    .pop .msg b { display: block; font-size: 12px; }
    .pop .msg small { color: #6b7280; }
    .pop textarea { width: 100%; min-height: 70px; padding: 8px; border: 1px solid #d1d5db; border-radius: 8px; font: inherit; resize: vertical; }
    .pop .row { display: flex; gap: 6px; justify-content: flex-end; margin-top: 8px; flex-wrap: wrap; }
    .pop button { font: inherit; padding: 6px 10px; border-radius: 8px; border: 1px solid #d1d5db; background: #fff; cursor: pointer; }
    .pop button.primary { background: #1d1d1b; color: #fff; border-color: #1d1d1b; }
    .pop .hint { font-size: 12px; color: #6b7280; margin: 6px 0 0; }
    .pop pre { white-space: pre-wrap; background: #f3f4f6; padding: 8px; border-radius: 8px; font: 12px/1.4 ui-monospace, monospace; max-height: 180px; overflow: auto; }
    .panel { position: fixed; right: 16px; top: 16px; bottom: 80px; width: 340px; max-width: calc(100vw - 32px); overflow: auto; background: #fff; color: #1d1d1b; border-radius: 14px;
      box-shadow: 0 12px 40px rgba(0,0,0,.3); padding: 14px; font-size: 13px; }
    .panel h3 { margin: 0 0 8px; font-size: 14px; display: flex; justify-content: space-between; align-items: center; }
    .panel label { font-size: 12px; color: #6b7280; }
    .item { padding: 8px; border-radius: 8px; cursor: pointer; border: 1px solid #eee; margin: 6px 0; }
    .item:hover { border-color: #81ba49; }
    .item.resolved { opacity: .55; }
    .item small { color: #6b7280; }
    .empty { color: #6b7280; padding: 12px 0; }
    .toast { position: fixed; left: 50%; bottom: 76px; transform: translateX(-50%); background: #1d1d1b; color: #fff; padding: 8px 14px; border-radius: 10px; font-size: 13px; }
    body.pg-commenting * { cursor: crosshair !important; }
  </style>
  <div class="pins"></div>
  <div class="hl" hidden></div>
  <div class="bar"></div>`
  const bar = root.querySelector('.bar')
  const pinsEl = root.querySelector('.pins')
  const hl = root.querySelector('.hl')
  let pop = null
  let panel = null

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
  const toast = text => {
    const t = document.createElement('div')
    t.className = 'toast'
    t.textContent = text
    root.appendChild(t)
    setTimeout(() => t.remove(), 2200)
  }
  const copy = text => navigator.clipboard.writeText(text).then(() => toast('In die Zwischenablage kopiert – in Claude einfügen'))

  // ── Toolbar ──────────────────────────────────────────────────────────────
  function renderBar() {
    const parts = [`<button class="toggle" data-act="min" title="Toolbar ein-/ausklappen">◐</button>`, `<a href="${base}">Übersicht</a>`, '<span class="sep"></span>']
    if (PG.mode === 'idea') {
      const pageOpts = (PG.pages || []).map(p => `<option value="${esc(p.name)}" ${p.name === PG.page ? 'selected' : ''}>${esc(p.title)}</option>`).join('')
      parts.push(`<a class="label" href="${base}ideen/${PG.idea.slug}/" title="${esc(PG.idea.title)}">${esc(PG.idea.title)}<span class="status">${esc(PG.idea.statusLabel)}</span></a>`)
      if ((PG.pages || []).length > 1) parts.push(`<select data-act="page" title="Seite der Idee">${pageOpts}</select>`)
      if (PG.hasBefore) {
        const isBefore = PG.variant === 'vorher'
        const target = `${base}ideen/${PG.idea.slug}/${PG.page}/${isBefore ? '' : 'vorher/'}`
        parts.push(`<a href="${target}${location.hash}" class="${isBefore ? 'on' : ''}" title="Gleiche Seite mit den Original-Modulen">Vorher</a>`)
      }
      parts.push('<span class="sep"></span>')
      const open = comments.filter(c => !c.resolved).length
      parts.push(`<button data-act="comment" class="${commentMode ? 'on' : ''}" title="Kommentar setzen (Taste C)">＋ Kommentar</button>`)
      parts.push(`<button data-act="panel" class="${panel ? 'on' : ''}">💬 ${open}</button>`)
      parts.push(`<a href="${base}ideen/${PG.idea.slug}/#entwickler" title="Diffs, Block-Markup, Checkliste">Dev</a>`)
    } else if (PG.mode === 'live') {
      parts.push(`<span class="label" title="${esc(PG.title)}">Live: ${PG.title}</span>`)
      parts.push(`<a href="${esc(PG.liveUrl)}" target="_blank" rel="noopener">Original ↗</a>`)
      parts.push(`<button data-act="prompt-live" title="Prompt für Claude kopieren">Idee daraus starten</button>`)
    } else if (PG.mode === 'module') {
      parts.push(`<span class="label">Modul ${esc(PG.blockName)}${PG.template !== 'ok' ? ' · ohne Template' : ''}</span>`)
      parts.push(`<a href="${base}module/">Alle Module</a>`)
      parts.push(`<button data-act="prompt-module">Anpassung starten</button>`)
    }
    bar.innerHTML = parts.join('')
  }

  bar.addEventListener('click', e => {
    const el = e.target.closest('[data-act]')
    if (!el || el.tagName === 'SELECT') return
    const act = el.dataset.act
    if (act === 'min') bar.classList.toggle('min')
    if (act === 'comment') setCommentMode(!commentMode)
    if (act === 'panel') togglePanel()
    if (act === 'prompt-live') copy(`/seite-bauen Neue Idee auf Basis der Live-Seite „${PG.title}“ (${PG.page}). Ich möchte: `)
    if (act === 'prompt-module') copy(`/modul-anpassen ${PG.blockName.split('/')[1]} – Ich möchte: `)
  })
  bar.addEventListener('change', e => {
    if (e.target.dataset.act === 'page') location.href = `${base}ideen/${PG.idea.slug}/${e.target.value}/${PG.variant === 'vorher' ? 'vorher/' : ''}`
  })

  // ── Element ↔ Anker ──────────────────────────────────────────────────────
  // Anker = Modul-Block (Name + n-tes Vorkommen) + CSS-Pfad darin + Textauszug zur Kontrolle.
  function describe(el) {
    const blockEl = el.closest('[data-pg-block]')
    const baseEl = blockEl || document.querySelector('main#main .is-root-container') || document.body
    const anchor = blockEl
      ? { block: blockEl.dataset.pgBlock, nth: [...document.querySelectorAll(`[data-pg-block="${blockEl.dataset.pgBlock}"]`)].indexOf(blockEl) }
      : null
    const steps = []
    for (let n = el; n && n !== baseEl; n = n.parentElement) {
      const sameTag = [...n.parentElement.children].filter(c => c.tagName === n.tagName)
      steps.unshift(`${n.tagName.toLowerCase()}:nth-of-type(${sameTag.indexOf(n) + 1})`)
    }
    return { anchor, path: steps.join(' > '), snippet: (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80) }
  }
  function locate(c) {
    let baseEl = document.querySelector('main#main .is-root-container') || document.body
    if (c.anchor) baseEl = document.querySelectorAll(`[data-pg-block="${c.anchor.block}"]`)[c.anchor.nth] || null
    if (!baseEl) return null
    if (!c.path) return baseEl
    try {
      return baseEl.querySelector(':scope > ' + c.path) || baseEl
    } catch (e) {
      return baseEl
    }
  }
  const humanTarget = c => `${c.anchor ? `${c.anchor.block} #${c.anchor.nth + 1}` : 'Seite'}${c.path ? ' › ' + c.path : ''}${c.snippet ? ` („${c.snippet}“)` : ''}`

  // ── Pins ─────────────────────────────────────────────────────────────────
  function renderPins() {
    if (PG.mode !== 'idea') return
    pinsEl.innerHTML = ''
    const visible = comments.filter(c => showResolved || !c.resolved)
    visible.forEach(c => {
      const el = locate(c)
      const pin = document.createElement('div')
      const idx = comments.indexOf(c) + 1
      pin.className = 'pin' + (c.resolved ? ' resolved' : '') + (el ? '' : ' lost') + (openId === c.id ? ' active' : '')
      pin.textContent = idx
      pin.title = `${c.author}: ${c.text}`
      const r = (el || document.body).getBoundingClientRect()
      const x = el ? r.left + scrollX + (r.width * c.xPct) / 100 : 24
      const y = el ? r.top + scrollY + (r.height * c.yPct) / 100 : 120 + idx * 34
      pin.style.left = x + 'px'
      pin.style.top = y + 'px'
      pin.addEventListener('click', ev => {
        ev.stopPropagation()
        openThread(c, x, y)
      })
      pinsEl.appendChild(pin)
    })
  }
  let raf = 0
  const schedule = () => {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(renderPins)
  }
  addEventListener('resize', schedule)
  addEventListener('load', schedule)
  new ResizeObserver(schedule).observe(document.body)

  // ── Popover ──────────────────────────────────────────────────────────────
  function closePop() {
    pop?.remove()
    pop = null
    openId = null
    schedule()
  }
  function placePop(x, y) {
    pop.style.left = Math.max(12, Math.min(x + 16, scrollX + innerWidth - 340)) + 'px'
    pop.style.top = Math.max(scrollY + 12, y - 20) + 'px'
  }
  function promptFor(action, payload) {
    const head = `In Idee „${PG.idea.slug}“, Seite „${PG.page}“`
    if (action === 'add') return `/kommentare-abarbeiten ${head}: Füge einen Kommentar hinzu (Anker ${JSON.stringify({ anchor: payload.anchor, path: payload.path, xPct: payload.xPct, yPct: payload.yPct, snippet: payload.snippet })}).\nElement: ${humanTarget(payload)}\nKommentar: ${payload.text}`
    if (action === 'reply') return `/kommentare-abarbeiten ${head}: Antworte auf Kommentar ${payload.id}: ${payload.text}`
    if (action === 'resolve') return `/kommentare-abarbeiten ${head}: Markiere Kommentar ${payload.id} als erledigt.`
    return ''
  }

  async function api(body) {
    const res = await fetch(`${base}__api/comments`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ idea: PG.idea.slug, ...body }) })
    if (!res.ok) throw new Error(await res.text())
    comments = (await res.json()).filter(c => c.page === PG.page)
    renderBar()
    schedule()
    if (panel) renderPanel()
  }

  function openNew(el, x, y, xPct, yPct) {
    closePop()
    const d = describe(el)
    pop = document.createElement('div')
    pop.className = 'pop'
    pop.innerHTML = `<h4>Neuer Kommentar · ${esc(humanTarget(d))}</h4>
      <textarea placeholder="Was soll sich ändern? (⌘/Ctrl+Enter speichert)"></textarea>
      <div class="row"><button data-x="cancel">Abbrechen</button><button class="primary" data-x="save">${writable ? 'Speichern' : 'Als Prompt kopieren'}</button></div>
      ${writable ? `<p class="hint">Wird als ${esc(me || 'du')} in ideas/${esc(PG.idea.slug)}/comments.json gespeichert – danach committen.</p>` : '<p class="hint">Online sind Kommentare nur lesbar. Der kopierte Prompt legt den Kommentar über Claude an.</p>'}`
    root.appendChild(pop)
    placePop(x, y)
    const ta = pop.querySelector('textarea')
    ta.focus()
    const save = async () => {
      const text = ta.value.trim()
      if (!text) return
      const payload = { ...d, xPct, yPct, text, page: PG.page, viewport: innerWidth }
      if (writable) {
        try {
          await api({ action: 'add', ...payload })
          closePop()
          toast('Kommentar gespeichert')
        } catch (e) {
          toast('Fehler: ' + e.message)
        }
      } else {
        copy(promptFor('add', payload))
        closePop()
      }
    }
    pop.addEventListener('click', e => {
      if (e.target.dataset.x === 'cancel') closePop()
      if (e.target.dataset.x === 'save') save()
    })
    ta.addEventListener('keydown', e => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save()
      if (e.key === 'Escape') closePop()
    })
  }

  function openThread(c, x, y) {
    closePop()
    openId = c.id
    pop = document.createElement('div')
    pop.className = 'pop'
    const msgs = [c, ...(c.replies || [])]
      .map(m => `<p class="msg"><b>${esc(m.author)} <small>${esc((m.created || '').slice(0, 16).replace('T', ' '))}</small></b>${esc(m.text)}</p>`)
      .join('')
    pop.innerHTML = `<h4>#${comments.indexOf(c) + 1} · ${esc(humanTarget(c))}${c.resolved ? ' · ✓ erledigt' : ''}</h4>${msgs}
      ${PG.locked ? '<p class="hint">Idee ist gesperrt (Status) – keine neuen Antworten.</p>' : `<textarea placeholder="Antworten …"></textarea>`}
      <div class="row">
        <button data-x="close">Schließen</button>
        ${PG.locked ? '' : `<button data-x="resolve">${c.resolved ? 'Wieder öffnen' : 'Erledigt'}</button><button class="primary" data-x="reply">${writable ? 'Antworten' : 'Antwort kopieren'}</button>`}
      </div>`
    root.appendChild(pop)
    placePop(x, y)
    schedule()
    pop.addEventListener('click', async e => {
      const x2 = e.target.dataset.x
      if (x2 === 'close') closePop()
      if (x2 === 'reply') {
        const text = pop.querySelector('textarea').value.trim()
        if (!text) return
        if (writable) await api({ action: 'reply', id: c.id, text })
        else copy(promptFor('reply', { id: c.id, text }))
        closePop()
      }
      if (x2 === 'resolve') {
        if (writable) await api({ action: 'resolve', id: c.id, resolved: !c.resolved })
        else copy(promptFor('resolve', { id: c.id }))
        closePop()
      }
    })
  }

  // ── Kommentar-Modus ──────────────────────────────────────────────────────
  function setCommentMode(on) {
    if (PG.mode !== 'idea') return
    if (on && PG.locked) return toast('Idee ist gesperrt – keine neuen Kommentare')
    commentMode = on
    document.body.classList.toggle('pg-commenting', on)
    hl.hidden = !on
    renderBar()
  }
  const isOverlay = t => t === host || host.contains(t)
  document.addEventListener(
    'mousemove',
    e => {
      if (!commentMode || isOverlay(e.target)) return
      const r = e.target.getBoundingClientRect()
      Object.assign(hl.style, { left: r.left + scrollX + 'px', top: r.top + scrollY + 'px', width: r.width + 'px', height: r.height + 'px' })
    },
    true
  )
  document.addEventListener(
    'click',
    e => {
      if (isOverlay(e.target)) return
      if (!commentMode) {
        if (pop) closePop()
        return
      }
      e.preventDefault()
      e.stopPropagation()
      const el = e.target
      const r = el.getBoundingClientRect()
      const xPct = Math.round(((e.clientX - r.left) / Math.max(r.width, 1)) * 1000) / 10
      const yPct = Math.round(((e.clientY - r.top) / Math.max(r.height, 1)) * 1000) / 10
      setCommentMode(false)
      openNew(el, e.clientX + scrollX, e.clientY + scrollY, xPct, yPct)
    },
    true
  )
  document.addEventListener('keydown', e => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.composedPath()[0] || {}).tagName) || e.target.isContentEditable
    if (typing) return
    if ((e.key === 'c' || e.key === 'C') && !e.metaKey && !e.ctrlKey) setCommentMode(!commentMode)
    if (e.key === 'Escape') {
      setCommentMode(false)
      closePop()
    }
  })

  // ── Panel ────────────────────────────────────────────────────────────────
  function togglePanel() {
    if (panel) {
      panel.remove()
      panel = null
    } else {
      panel = document.createElement('div')
      panel.className = 'panel'
      root.appendChild(panel)
      renderPanel()
    }
    renderBar()
  }
  function renderPanel() {
    const list = comments.filter(c => showResolved || !c.resolved)
    panel.innerHTML = `<h3>Kommentare <button data-x="close" style="all:unset;cursor:pointer">✕</button></h3>
      <label><input type="checkbox" data-x="resolved" ${showResolved ? 'checked' : ''}> erledigte anzeigen</label>
      ${list.length ? '' : '<p class="empty">Keine Kommentare auf dieser Seite. Taste C drücken und auf ein Element klicken.</p>'}
      ${list
        .map(
          c => `<div class="item ${c.resolved ? 'resolved' : ''}" data-id="${esc(c.id)}"><small>#${comments.indexOf(c) + 1} · ${esc(c.author)} · ${(c.replies || []).length} Antworten</small><div>${esc(c.text)}</div></div>`
        )
        .join('')}`
    panel.onclick = e => {
      if (e.target.dataset.x === 'close') return togglePanel()
      const item = e.target.closest('.item')
      if (!item) return
      const c = comments.find(x => x.id === item.dataset.id)
      const el = locate(c)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setTimeout(() => {
        const r = (el || document.body).getBoundingClientRect()
        openThread(c, r.left + scrollX + (r.width * c.xPct) / 100, r.top + scrollY + (r.height * c.yPct) / 100)
      }, 400)
    }
    panel.onchange = e => {
      if (e.target.dataset.x === 'resolved') {
        showResolved = e.target.checked
        renderPanel()
        schedule()
      }
    }
  }

  // ── Start ────────────────────────────────────────────────────────────────
  renderBar()
  schedule()
  if (writable) {
    fetch(`${base}__api/whoami`).then(r => r.json()).then(d => (me = d.user)).catch(() => {})
    fetch(`${base}__api/comments?idea=${encodeURIComponent(PG.idea.slug)}`)
      .then(r => r.json())
      .then(all => {
        comments = all.filter(c => c.page === PG.page)
        renderBar()
        schedule()
      })
      .catch(() => {})
  }
  const m = /^#pg-comment-(.+)$/.exec(location.hash)
  if (m)
    addEventListener('load', () => {
      const c = comments.find(x => x.id === m[1])
      if (!c) return
      const el = locate(c)
      el?.scrollIntoView({ block: 'center' })
      setTimeout(() => {
        const r = (el || document.body).getBoundingClientRect()
        openThread(c, r.left + scrollX + (r.width * c.xPct) / 100, r.top + scrollY + (r.height * c.yPct) / 100)
      }, 300)
    })
  // Live-Reload im Dev-Server
  if (PG.writable && window.EventSource) {
    const es = new EventSource(`${base}__pg/events`)
    es.onmessage = e => e.data === 'reload' && location.reload()
  }
})()
