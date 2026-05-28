import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

/**
 * Typed navigation helpers bound to our routing config.
 *
 * Use these throughout the app instead of `next/link` or `useRouter`
 * directly — they automatically include the current locale and handle
 * pathname localization (e.g., they know that the EN `/posts/[slug]`
 * route is exposed at `/it/articoli/[slug]` in Italian).
 *
 * ```tsx
 * import { Link } from '@/i18n/navigation'
 * <Link href={{ pathname: '/posts/[slug]', params: { slug: 'foo' } }} />
 * ```
 */

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
