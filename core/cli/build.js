// yarn build – statischer Build nach dist/ (PG_BASE=/dhsv-playground/ für GitHub Pages)
import { build } from '../lib/build.js'

const base = process.env.PG_BASE ?? '/'
const r = await build({ base })
console.log(`✓ Build in ${r.ms} ms – ${r.ideas} Ideen, ${r.live} Live-Seiten (base ${base})`)
