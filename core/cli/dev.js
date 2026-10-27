// yarn dev – lokaler Playground mit Live-Reload und schreibbaren Kommentaren.
//   http://localhost:4360/   (PORT=… zum Ändern)
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import chokidar from 'chokidar'
import { PATHS, currentUser } from '../lib/context.js'
import { build } from '../lib/build.js'
import { readComments, applyCommentAction } from '../lib/comments.js'

const PORT = Number(process.env.PORT || 4360)
const user = currentUser()
const clients = new Set()
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
  '.avif': 'image/avif', '.mp4': 'video/mp4', '.webm': 'video/webm', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf', '.txt': 'text/plain',
}

let building = null
let queued = false
async function rebuild(reason) {
  if (building) return void (queued = true)
  building = build({ base: '/', dev: true })
    .then(r => console.log(`✓ ${reason} → neu gebaut in ${r.ms} ms`))
    .catch(e => console.error('✗ Build-Fehler:', e.message))
  await building
  building = null
  for (const res of clients) res.write('data: reload\n\n')
  if (queued) {
    queued = false
    rebuild('weitere Änderungen')
  }
}

const readBody = req => new Promise((resolve, reject) => {
  let data = ''
  req.on('data', c => (data += c))
  req.on('end', () => { try { resolve(JSON.parse(data || '{}')) } catch (e) { reject(e) } })
})

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost')
  try {
    if (url.pathname === '/__pg/events') {
      res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' })
      res.write(': ok\n\n')
      clients.add(res)
      req.on('close', () => clients.delete(res))
      return
    }
    if (url.pathname === '/__api/whoami') return json(res, { user })
    if (url.pathname === '/__api/comments') {
      if (req.method === 'GET') return json(res, readComments(url.searchParams.get('idea')))
      if (req.method === 'POST') {
        const body = await readBody(req)
        const all = applyCommentAction(body.idea, body, user)
        console.log(`💬 ${user}: ${body.action} in ${body.idea}`)
        return json(res, all)
      }
    }
    let file = path.join(PATHS.dist, decodeURIComponent(url.pathname))
    if (!file.startsWith(PATHS.dist)) throw Object.assign(new Error('forbidden'), { status: 403 })
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html')
    if (!fs.existsSync(file)) {
      if (!url.pathname.endsWith('/') && !path.extname(url.pathname)) {
        res.writeHead(302, { location: url.pathname + '/' })
        return res.end()
      }
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
      return res.end('404 – nicht gefunden (evtl. noch nicht gebaut)')
    }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' })
    fs.createReadStream(file).pipe(res)
  } catch (e) {
    res.writeHead(e.status || 400, { 'content-type': 'text/plain; charset=utf-8' })
    res.end(e.message)
  }
})
const json = (res, data) => {
  res.writeHead(200, { 'content-type': 'application/json' })
  res.end(JSON.stringify(data))
}

await rebuild('Start')
server.listen(PORT, () => console.log(`\n▶ Playground läuft auf http://localhost:${PORT}/  (als ${user})\n`))

let timer = null
chokidar
  .watch(['ideas', 'modules', 'theme', 'layout', 'pages', 'core', '.claude/skills', 'docs', 'playground.config.js'].map(p => path.join(PATHS.root, p)), {
    ignoreInitial: true,
    ignored: p => p.endsWith('comments.json') || p.includes('node_modules'),
  })
  .on('all', (event, file) => {
    clearTimeout(timer)
    timer = setTimeout(() => rebuild(path.relative(PATHS.root, file)), 150)
  })
