interface SpotifyProps {
  /** A Spotify share URL, e.g. https://open.spotify.com/track/<id> (track/album/playlist/episode). */
  url: string
  /** Accessible iframe title. */
  title?: string
  /** Force the compact 152px player (default: tall 352px for albums/playlists). */
  compact?: boolean
  /** Optional line under the player. */
  caption?: string
}

const SPOTIFY_TYPES = new Set(['track', 'album', 'playlist', 'episode', 'artist', 'show'])
const TALL_TYPES = new Set(['album', 'playlist', 'artist', 'show'])

/** Parse `{type,id}` out of a Spotify share or embed URL; null if not recognised. */
function parseSpotify(url: string): { type: string; id: string } | null {
  try {
    const u = new URL(url)
    if (!u.hostname.endsWith('spotify.com')) return null
    const parts = u.pathname.split('/').filter(Boolean)
    const [type, id] = parts[0] === 'embed' ? [parts[1], parts[2]] : [parts[0], parts[1]]
    if (!type || !id || !SPOTIFY_TYPES.has(type)) return null
    return { type, id }
  } catch {
    return null
  }
}

/**
 * Spotify embed (official iframe). Pass a share URL; the player is server-rendered
 * (no client JS) and lazy-loaded. Use for a track/album/playlist in a music post,
 * or as the "on repeat" widget on /now. Renders nothing for an unrecognised URL.
 *
 *   <Spotify url="https://open.spotify.com/track/…" caption="On repeat" />
 */
export function Spotify({ url, title, compact, caption }: SpotifyProps) {
  const parsed = parseSpotify(url)
  if (!parsed) return null
  const height = compact ? 152 : TALL_TYPES.has(parsed.type) ? 352 : 152

  return (
    <figure className="my-8">
      <iframe
        title={title ?? 'Spotify player'}
        src={`https://open.spotify.com/embed/${parsed.type}/${parsed.id}`}
        width="100%"
        height={height}
        loading="lazy"
        allow="encrypted-media; clipboard-write; fullscreen; picture-in-picture"
        className="w-full rounded-xl border border-ink/10"
      />
      {caption ? (
        <figcaption className="mt-2 text-center font-mono text-[0.72rem] uppercase tracking-[0.18em] text-ink/70">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
