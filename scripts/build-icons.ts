/**
 * Build-time favicon / app-icon generator.
 *
 * From one "AS" monogram SVG, rasterises every icon size with sharp and writes
 * a web manifest. Runs before `next build` (see package.json `build`). Output
 * lands in `public/icons/` (gitignored, regenerated each build - like OG images).
 *
 * basePath: the manifest's start_url is baked from BASE_PATH so it's correct on
 * the project-site deploy (`/blog`) and locally (empty). Icon hrefs in <head>
 * are basePath-prefixed in the root layout's metadata.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

const OUT = join(process.cwd(), 'public', 'icons')
const BASE = process.env.BASE_PATH ?? ''

// Warm palette matching the site tokens (hex so the SVG rasteriser is happy).
const COPPER = '#b4502a'
const CREAM = '#fbf9f5'

const MONOGRAM = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="${COPPER}"/>
  <text x="50%" y="52%" dy="0.06em" text-anchor="middle" dominant-baseline="central"
        font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="300"
        letter-spacing="-8" fill="${CREAM}">AS</text>
</svg>`

const PNGS: { file: string; size: number }[] = [
  { file: 'favicon-16.png', size: 16 },
  { file: 'favicon-32.png', size: 32 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
]

const MANIFEST = {
  name: 'Alessio Sopranzi - writings',
  short_name: 'Sopranzi',
  start_url: `${BASE}/`,
  display: 'standalone',
  background_color: CREAM,
  theme_color: CREAM,
  icons: [
    { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
  ],
}

async function main() {
  console.log('▸ Building icons...')
  await mkdir(OUT, { recursive: true })

  const svg = Buffer.from(MONOGRAM)
  await writeFile(join(OUT, 'favicon.svg'), MONOGRAM, 'utf-8')
  console.log('  ✓ favicon.svg')

  for (const { file, size } of PNGS) {
    await sharp(svg).resize(size, size).png().toFile(join(OUT, file))
    console.log(`  ✓ ${file}`)
  }

  await writeFile(
    join(OUT, 'manifest.webmanifest'),
    `${JSON.stringify(MANIFEST, null, 2)}\n`,
    'utf-8',
  )
  console.log('  ✓ manifest.webmanifest')
  console.log(`▸ Icons done (${PNGS.length + 1} files + manifest).`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
