/**
 * Responsive photo pipeline (run manually when you add/change photos):
 *
 *   1. Put originals in  _media/<slug>/<name>.{jpg,jpeg,png}   (gitignored)
 *   2. pnpm build:media
 *   3. commit the generated WebP variants + the manifest
 *
 * For each original it writes WebP variants at up to 480/960/1440 px (never
 * upscaling, capped at 1440) into public/images/<slug>/, and records a manifest
 * (src + srcset + intrinsic size) keyed by the *authored* path
 * `/images/<slug>/<name>.<ext>`. <MdxImage> reads that manifest and emits a
 * responsive <img srcset>; images without an entry fall back to a plain <img>.
 */
import { mkdir, readdir, writeFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import sharp from 'sharp'

const SRC_ROOT = join(process.cwd(), '_media')
const OUT_ROOT = join(process.cwd(), 'public', 'images')
const MANIFEST = join(process.cwd(), 'src', 'generated', 'image-manifest.json')
const TARGETS = [480, 960, 1440]
const SRC_EXT = new Set(['.jpg', '.jpeg', '.png'])

interface Entry {
  src: string // fallback <img> (a WebP - widely supported)
  webp: string // srcset of WebP variants
  avif: string // srcset of AVIF variants (better compression, <picture> first choice)
  width: number
  height: number
}

async function listSlugs(): Promise<string[]> {
  try {
    const entries = await readdir(SRC_ROOT, { withFileTypes: true })
    return entries.filter((e) => e.isDirectory()).map((e) => e.name)
  } catch {
    return [] // no _media/ yet
  }
}

async function main() {
  console.log('▸ Building responsive photos...')
  const manifest: Record<string, Entry> = {}
  let count = 0

  for (const slug of await listSlugs()) {
    const srcDir = join(SRC_ROOT, slug)
    const outDir = join(OUT_ROOT, slug)
    await mkdir(outDir, { recursive: true })

    for (const file of await readdir(srcDir)) {
      const ext = extname(file).toLowerCase()
      if (!SRC_EXT.has(ext)) continue
      const name = file.slice(0, -ext.length)
      const input = join(srcDir, file)
      const meta = await sharp(input).metadata()
      const srcW = meta.width ?? TARGETS[0]
      const srcH = meta.height ?? srcW

      // Widths: each target <= source, never above 1440; plus the native width
      // (capped) so we don't lose sharpness, never upscaling.
      let widths = TARGETS.filter((w) => w <= srcW)
      const cap = Math.min(srcW, 1440)
      if (!widths.includes(cap)) widths.push(cap)
      widths = [...new Set(widths)].sort((a, b) => a - b)

      const webpParts: string[] = []
      const avifParts: string[] = []
      for (const w of widths) {
        const resized = sharp(input).resize({ width: w })
        await resized.clone().webp({ quality: 80 }).toFile(join(outDir, `${name}-${w}.webp`))
        await resized.clone().avif({ quality: 55 }).toFile(join(outDir, `${name}-${w}.avif`))
        webpParts.push(`/images/${slug}/${name}-${w}.webp ${w}w`)
        avifParts.push(`/images/${slug}/${name}-${w}.avif ${w}w`)
      }
      const largest = widths[widths.length - 1] ?? cap
      manifest[`/images/${slug}/${name}${ext}`] = {
        src: `/images/${slug}/${name}-${largest}.webp`,
        webp: webpParts.join(', '),
        avif: avifParts.join(', '),
        width: largest,
        height: Math.round((largest / srcW) * srcH),
      }
      count += 1
      console.log(`  ✓ ${slug}/${name} (${widths.join('/')})`)
    }
  }

  await mkdir(join(process.cwd(), 'src', 'generated'), { recursive: true })
  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8')
  console.log(`▸ Photos done (${count} source images → manifest).`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
