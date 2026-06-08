// Build guard: fail the build if any self-hosted video under public/videos/
// exceeds the size limit. Heavy video must go to an external host (YouTube/
// Vimeo) so the bytes never enter Git history or GitHub Pages bandwidth.
// Runs first in `pnpm build`.
import { readdirSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'

const ROOT = join(process.cwd(), 'public', 'videos')
const LIMIT_MB = 20
const LIMIT = LIMIT_MB * 1024 * 1024
const VIDEO_EXT = new Set(['.mp4', '.webm', '.mov', '.m4v', '.ogv'])

function walk(dir) {
  let files = []
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return files // public/videos/ may not exist yet - that's fine
  }
  for (const e of entries) {
    const p = join(dir, e.name)
    if (e.isDirectory()) files = files.concat(walk(p))
    else files.push(p)
  }
  return files
}

const tooBig = []
for (const file of walk(ROOT)) {
  if (!VIDEO_EXT.has(extname(file).toLowerCase())) continue
  const size = statSync(file).size
  if (size > LIMIT) tooBig.push([relative(process.cwd(), file), size])
}

if (tooBig.length > 0) {
  console.error(
    `✗ Self-hosted video over ${LIMIT_MB} MB - host heavy video on YouTube/Vimeo (<Vimeo>/<YouTube>) instead of public/videos/:`,
  )
  for (const [file, size] of tooBig) {
    console.error(`  ${file} - ${(size / 1024 / 1024).toFixed(1)} MB`)
  }
  process.exit(1)
}

console.log(`▸ Media check ok (no self-hosted video over ${LIMIT_MB} MB).`)
