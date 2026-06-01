import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

/**
 * Typed navigation helpers bound to our routing config.
 *
 * Use these for locale-aware navigation to *static* pathnames (e.g. the home
 * `/`): they automatically include the current locale prefix.
 *
 * Post links are NOT routed through here — they use a real dynamic segment and
 * the `postPath` helper from `./routing` (see ADR-006), passed to `next/link`.
 *
 * ```tsx
 * import { Link } from '@/i18n/navigation'
 * <Link href="/">home</Link>
 * ```
 */

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
