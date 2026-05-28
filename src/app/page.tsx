import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'
import { routing } from '@/i18n/routing'

/**
 * Root locale-detect splash.
 *
 * GitHub Pages serves only static files — there is no server-side request
 * handler that can read `Accept-Language` and redirect. So this page emits
 * a minimal document with an inline `<script>` that:
 *
 *   1. If the user has previously chosen a locale (saved in localStorage
 *      by `LocaleSwitcher`), respects it.
 *   2. Otherwise reads `navigator.language` and routes to /it/ if it
 *      begins with "it", else falls back to the default locale (/en/).
 *   3. For visitors with JavaScript off, shows two manual links inside
 *      a `<noscript>` block.
 *
 * The page opts out of indexing so crawlers see /en/ and /it/ as the
 * canonical URLs (and the splash itself is invisible to search).
 *
 * Intentionally inherits ONLY the bare root layout — no fonts, no Tailwind,
 * no providers. The user is here for <200 ms before the redirect fires.
 */

const STORAGE_KEY = 'preferred-locale'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  // Absolute URLs so basePath isn't dropped (Next does not apply it to
  // metadata). Low stakes here since the splash is noindex, but consistent.
  alternates: {
    canonical: `${siteConfig.url}/${routing.defaultLocale}`,
    languages: Object.fromEntries(
      routing.locales.map((l) => [l, `${siteConfig.url}/${l}`]),
    ),
  },
}

// Under project-site mode the splash is served at `${basePath}/` and the
// locale homes at `${basePath}/en/` etc. The inline script runs in the browser
// where it can't read build-time env, so we bake the basePath in as a literal.
// In user-site/local mode basePath is '' and targets collapse to `/en/`.
const inlineRedirectScript = `
(function(){
  var bp = ${JSON.stringify(siteConfig.basePath)};
  try {
    var saved = localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
    if (saved === 'en' || saved === 'it') {
      window.location.replace(bp + '/' + saved + '/');
      return;
    }
  } catch (e) { /* localStorage may throw — fall through */ }
  var lang = (navigator.language || 'en').toLowerCase();
  var target = lang.indexOf('it') === 0 ? bp + '/it/' : bp + '/en/';
  window.location.replace(target);
})();
`.trim()

const inlineStyle = `
  body{font-family:system-ui,sans-serif;margin:0;padding:20vh 1.5rem;text-align:center;color:#1d1c1a;background:#fbf9f5}
  h1{font-size:1.25rem;font-weight:500;margin:0 0 1rem}
  a{color:#c8772f;text-decoration:underline;text-underline-offset:3px;margin:0 .5rem}
`.trim()

export default function RootSplash() {
  return (
    <>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: inline static styles */}
      <style dangerouslySetInnerHTML={{ __html: inlineStyle }} />
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: inline static redirect script */}
      <script dangerouslySetInnerHTML={{ __html: inlineRedirectScript }} />
      <noscript>
        <h1>Alessio Sopranzi</h1>
        <p>Please choose a language — Scegli una lingua:</p>
        <p>
          <a href={`${siteConfig.basePath}/en/`}>English</a>
          <a href={`${siteConfig.basePath}/it/`}>Italiano</a>
        </p>
      </noscript>
    </>
  )
}
