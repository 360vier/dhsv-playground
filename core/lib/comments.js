// Kommentare einer Idee lesen/schreiben (ideas/<slug>/comments.json) – genutzt vom Dev-Server und der CLI.
import path from 'node:path'
import crypto from 'node:crypto'
import { PATHS, readJson, writeJson, exists } from './context.js'

const file = slug => path.join(PATHS.ideas, slug, 'comments.json')
const validSlug = slug => /^[a-z0-9-]+$/.test(slug) && exists(path.join(PATHS.ideas, slug, 'idea.json'))

export function readComments(slug) {
  if (!validSlug(slug)) throw new Error(`Unbekannte Idee: ${slug}`)
  return readJson(file(slug), [])
}

export function applyCommentAction(slug, action, user) {
  const comments = readComments(slug)
  const now = new Date().toISOString()
  const find = id => {
    const c = comments.find(x => x.id === id)
    if (!c) throw new Error(`Kommentar ${id} nicht gefunden`)
    return c
  }
  const text = String(action.text ?? '').trim().slice(0, 4000)
  switch (action.action) {
    case 'add':
      if (!text) throw new Error('Leerer Kommentar')
      comments.push({
        id: crypto.randomBytes(4).toString('hex'),
        page: String(action.page),
        anchor: action.anchor ?? null,
        path: String(action.path ?? ''),
        snippet: String(action.snippet ?? '').slice(0, 120),
        xPct: Number(action.xPct) || 0,
        yPct: Number(action.yPct) || 0,
        viewport: Number(action.viewport) || null,
        author: user,
        created: now,
        text,
        replies: [],
        resolved: false,
      })
      break
    case 'reply':
      if (!text) throw new Error('Leere Antwort')
      find(action.id).replies.push({ author: user, created: now, text })
      break
    case 'resolve': {
      const c = find(action.id)
      c.resolved = action.resolved !== false
      c.resolvedBy = c.resolved ? user : null
      c.resolvedAt = c.resolved ? now : null
      if (action.commit) c.resolvedIn = String(action.commit)
      break
    }
    case 'delete': {
      const c = find(action.id)
      if (c.author !== user) throw new Error('Nur eigene Kommentare löschen')
      comments.splice(comments.indexOf(c), 1)
      break
    }
    default:
      throw new Error(`Unbekannte Aktion ${action.action}`)
  }
  writeJson(file(slug), comments)
  return comments
}
