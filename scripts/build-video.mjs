// Optional clip compressor (run manually: `pnpm build:video`). Transcodes the
// heavy originals in _media/<slug>/ into web-friendly, compressed MP4 + a poster
// frame, into public/videos/<slug>/. NOT part of `pnpm build` (ffmpeg isn't a
// build dependency); the 20 MB guard (check-media.mjs) still applies to the
// output - if a clip is still too big, host it on YouTube/Vimeo instead.
//
// Requires ffmpeg on PATH. Source: .mov/.mp4/.m4v/.webm. Output: <name>.mp4 +
// <name>-poster.jpg. Reference with <Video src="/videos/<slug>/<name>.mp4"
// poster="/videos/<slug>/<name>-poster.jpg" />.
import { spawnSync } from 'node:child_process'
import { mkdirSync, readdirSync } from 'node:fs'
import { extname, join } from 'node:path'

const SRC_ROOT = join(process.cwd(), '_media')
const OUT_ROOT = join(process.cwd(), 'public', 'videos')
const SRC_EXT = new Set(['.mov', '.mp4', '.m4v', '.webm'])
const MAX_WIDTH = 1280
const CRF = 28 // higher = smaller/lower-quality; 23-28 is a sensible web range

function listSlugs() {
  try {
    return readdirSync(SRC_ROOT, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
  } catch {
    return []
  }
}

// Collect (slug, file) source videos.
const sources = []
for (const slug of listSlugs()) {
  for (const file of readdirSync(join(SRC_ROOT, slug))) {
    if (SRC_EXT.has(extname(file).toLowerCase())) sources.push({ slug, file })
  }
}

if (sources.length === 0) {
  console.log('▸ No source videos in _media/<slug>/ - nothing to do.')
  process.exit(0)
}

// ffmpeg must be available.
const probe = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' })
if (probe.error || probe.status !== 0) {
  console.error(
    'ffmpeg not found on PATH. Install it (https://ffmpeg.org/download.html) and re-run, ' +
      'or compress the clip with another tool and drop it straight into public/videos/<slug>/.',
  )
  process.exit(1)
}

for (const { slug, file } of sources) {
  const name = file.slice(0, -extname(file).length)
  const input = join(SRC_ROOT, slug, file)
  const outDir = join(OUT_ROOT, slug)
  mkdirSync(outDir, { recursive: true })
  const outMp4 = join(outDir, `${name}.mp4`)
  const poster = join(outDir, `${name}-poster.jpg`)

  console.log(`  • ${slug}/${file} -> ${name}.mp4 (+ poster)`)
  const enc = spawnSync(
    'ffmpeg',
    [ '-y', '-i', input,
      '-vf', `scale='min(${MAX_WIDTH},iw)':-2`,
      '-c:v', 'libx264', '-crf', String(CRF), '-preset', 'medium',
      '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart',
      outMp4 ],
    { stdio: 'inherit' },
  )
  if (enc.status !== 0) process.exit(enc.status ?? 1)
  spawnSync('ffmpeg', ['-y', '-ss', '1', '-i', input, '-frames:v', '1', '-q:v', '3', poster], {
    stdio: 'inherit',
  })
}

console.log(`▸ Video done (${sources.length} clip${sources.length > 1 ? 's' : ''}).`)
console.log('  Reminder: the 20 MB guard runs in `pnpm build` - host bigger clips externally.')
