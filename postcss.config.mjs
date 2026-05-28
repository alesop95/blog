/**
 * Tailwind v4 ships its PostCSS plugin as a separate package.
 * That's the only thing we need here — no autoprefixer (v4 handles it),
 * no nesting plugin (Lightning CSS does it natively).
 */
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
