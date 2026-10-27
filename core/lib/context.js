// Gemeinsame Pfade, Config und kleine Helfer für alle CLI-Scripts.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { execSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

export const PATHS = {
  root: ROOT,
  core: path.join(ROOT, 'core'),
  theme: path.join(ROOT, 'theme'),
  modules: path.join(ROOT, 'modules'),
  layout: path.join(ROOT, 'layout'),
  pagesLive: path.join(ROOT, 'pages', 'live'),
  ideas: path.join(ROOT, 'ideas'),
  skills: path.join(ROOT, '.claude', 'skills'),
  dist: path.join(ROOT, 'dist'),
  cache: path.join(ROOT, '.cache'),
}

export async function loadConfig() {
  const mod = await import(pathToFileURL(path.join(ROOT, 'playground.config.js')).href)
  return mod.default
}

export const exists = p => fs.existsSync(p)

export function readJson(file, fallback = undefined) {
  if (!fs.existsSync(file)) return fallback
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

export function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n')
}

export function writeFile(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, content)
}

export function readText(file, fallback = '') {
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : fallback
}

export function listDirs(dir) {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.') && !d.name.startsWith('_'))
    .map(d => d.name)
    .sort()
}

export function listFiles(dir, ext) {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isFile() && (!ext || d.name.endsWith(ext)))
    .map(d => d.name)
    .sort()
}

export function walk(dir, base = dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(d => {
    const full = path.join(dir, d.name)
    if (d.name === '.DS_Store') return []
    return d.isDirectory() ? walk(full, base) : [path.relative(base, full)]
  })
}

export function copyDir(src, dest, filter = () => true) {
  for (const rel of walk(src)) {
    if (!filter(rel)) continue
    const target = path.join(dest, rel)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.copyFileSync(path.join(src, rel), target)
  }
}

export const hash = content => crypto.createHash('sha1').update(content).digest('hex').slice(0, 12)
export const hashFile = file => (fs.existsSync(file) ? hash(fs.readFileSync(file)) : null)

export function sh(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], ...opts }).trim()
  } catch {
    return ''
  }
}

// GitHub-Username der Person, die gerade arbeitet (für Autor/Kommentare)
export function currentUser() {
  const fromEnv = process.env.PG_USER || process.env.GITHUB_ACTOR
  if (fromEnv) return fromEnv
  const fromGh = sh('gh api user --jq .login')
  if (fromGh) return fromGh
  return sh('git config user.name') || 'unbekannt'
}

export const today = () => new Date().toISOString().slice(0, 10)

export const slugify = s =>
  s
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)

export const escapeHtml = s =>
  String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
