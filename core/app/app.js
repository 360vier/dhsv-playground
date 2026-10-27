// Filter für die Ideenliste, einfache Suchfelder, Kopier-Buttons.
;(function () {
  const root = document.querySelector('[data-filter-root]')
  const list = document.querySelector('[data-filter-list]')
  if (root && list) {
    const KEY = 'pg-filters'
    const controls = [...root.querySelectorAll('[data-filter]')]
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '{}')
      controls.forEach(c => { if (saved[c.dataset.filter] != null) c.value = saved[c.dataset.filter] })
    } catch (e) {}
    const apply = () => {
      const f = Object.fromEntries(controls.map(c => [c.dataset.filter, c.value.trim().toLowerCase()]))
      try { localStorage.setItem(KEY, JSON.stringify(f)) } catch (e) {}
      list.querySelectorAll('.pg-card').forEach(card => {
        const d = card.dataset
        const statusOk = f.status === '*' ? true : f.status ? d.status === f.status : d.locked !== 'true'
        const ok = statusOk &&
          (!f.author || d.author.toLowerCase().split(' ').includes(f.author)) &&
          (!f.type || d.type === f.type) &&
          (!f.q || d.q.includes(f.q))
        card.hidden = !ok
      })
    }
    controls.forEach(c => c.addEventListener('input', apply))
    apply()
  }

  document.querySelectorAll('[data-simple-filter]').forEach(input => {
    const items = [...document.querySelectorAll(input.dataset.simpleFilter)]
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase()
      items.forEach(li => { li.hidden = q && !(li.dataset.q || li.textContent.toLowerCase()).includes(q) })
    })
  })

  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-copy]')
    if (!btn) return
    e.preventDefault()
    const el = document.querySelector(btn.dataset.copy)
    navigator.clipboard.writeText(el.textContent).then(() => {
      const t = btn.textContent
      btn.textContent = 'Kopiert ✓'
      setTimeout(() => (btn.textContent = t), 1500)
    })
  })
})()
