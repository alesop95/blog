// Minimal, dependency-free static server for the `out/` static export.
// Used by Playwright's webServer (and handy for ad-hoc local previews of the
// production build). Resolves trailingSlash URLs (`/en/` → `out/en/index.html`)
// and falls back to `out/404.html`. Usage: `node scripts/serve-out.mjs [port]`.

import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'

const ROOT = join(process.cwd(), 'out')
const PORT = Number(process.argv[2] ?? 4321)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.wasm': 'application/wasm',
  '.mp4': 'video/mp4',
}

/** Map a request path to a file inside out/, resolving directory indexes. */
async function resolveFile(urlPath) {
  // Strip query/hash, decode, and prevent path traversal out of ROOT.
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(
    /^(\.\.[/\\])+/,
    '',
  )
  const candidates = []
  if (extname(clean)) {
    candidates.push(join(ROOT, clean))
  } else {
    candidates.push(join(ROOT, clean, 'index.html'))
    candidates.push(join(ROOT, `${clean}.html`))
  }
  for (const file of candidates) {
    try {
      const s = await stat(file)
      if (s.isFile()) return file
    } catch {
      // try next candidate
    }
  }
  return null
}

const server = createServer(async (req, res) => {
  const file = (await resolveFile(req.url ?? '/')) ?? join(ROOT, '404.html')
  try {
    await stat(file)
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' })
    res.end('Not found')
    return
  }
  const type = MIME[extname(file)] ?? 'application/octet-stream'
  const status = file.endsWith('404.html') ? 404 : 200
  res.writeHead(status, { 'content-type': type })
  createReadStream(file).pipe(res)
})

server.listen(PORT, () => {
  console.log(`▸ Serving out/ at http://localhost:${PORT}`)
})
