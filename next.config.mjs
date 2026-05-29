import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/**
 * Next.js configuration for static export on GitHub Pages.
 *
 * Key choices:
 * • output: 'export'      – no Node/Edge runtime; pure HTML/CSS/JS in out/.
 * • images.unoptimized    – no on-the-fly resizing; resize source images before commit.
 * • trailingSlash: true   – produces /posts/foo/index.html instead of /posts/foo.html,
 *                            which is friendlier on GitHub Pages.
 * • basePath              – empty by default (user-site mode). If you fall back to
 *                            project-site mode (repo not named <user>.github.io), set:
 *                            BASE_PATH=/<repo-name> in your env.
 * • reactCompiler         – stable in Next 16, automatic memoisation.
 * • typedRoutes           – Link href is typechecked against your real routes.
 *
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js
 * @see https://github.com/amannn/next-intl
 */

const basePath = process.env.BASE_PATH ?? ''

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath,
  reactStrictMode: true,
  typedRoutes: true,
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],

  images: {
    // Required for static export – no image optimizer at runtime.
    unoptimized: true,
  },

  // React Compiler (stable in Next 16; moved out of `experimental` in 16.2).
  // Requires `babel-plugin-react-compiler` in devDependencies.
  reactCompiler: true,

  // Make basePath available to client code that needs it.
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
}

export default withNextIntl(nextConfig)
